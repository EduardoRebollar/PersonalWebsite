// UI sound-effects engine — Web Audio synthesized, ported from the original
// static/js/sounds.js. Reads enabled/volume imperatively from the settings
// store. Call `playSfx(name)` from any interaction. No-ops when SFX is off or
// Web Audio is unavailable (SSR / unsupported).

import { useLaHistorySettings } from '@/stores/useLaHistorySettings';

export type SfxName =
  | 'marker-click'
  | 'quiz-success'
  | 'quiz-error'
  | 'badge-earned'
  | 'hover'
  | 'panel-close'
  | 'panel-open'
  | 'quiz-open'
  | 'settings-open'
  | 'sidebar-toggle'
  | 'chat-toggle'
  | 'chat-send'
  | 'chat-receive'
  | 'clear-chat'
  | 'locked'
  | 'zoom'
  | 'mic-start'
  | 'mic-stop'
  | 'filter-toggle'
  | 'search-ping'
  | 'node-add'
  | 'edge-create'
  | 'undo'
  | 'tutorial-step'
  | 'tutorial-complete'
  | 'hint-reveal'
  | 'visit-earn'
  | 'era-unlock'
  | 'node-delete';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let playing = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  return ctx;
}

function note(
  c: AudioContext,
  freq: number,
  type: OscillatorType,
  gain: number,
  start: number,
  dur: number,
) {
  const osc = c.createOscillator();
  const vol = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  vol.gain.setValueAtTime(gain, c.currentTime + start);
  vol.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  osc.connect(vol).connect(master!);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur);
}

function sweep(
  c: AudioContext,
  type: OscillatorType,
  from: number,
  to: number,
  gain: number,
  dur: number,
): number {
  const osc = c.createOscillator();
  const vol = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur * 0.85);
  vol.gain.setValueAtTime(gain, c.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  osc.connect(vol).connect(master!);
  osc.start();
  osc.stop(c.currentTime + dur);
  return dur * 1000;
}

const SOUNDS: Record<SfxName, (c: AudioContext) => number> = {
  'marker-click': (c) => sweep(c, 'sine', 880, 440, 0.15, 0.12),
  'quiz-success': (c) => {
    note(c, 523.25, 'sine', 0.14, 0, 0.12);
    note(c, 659.25, 'sine', 0.14, 0.09, 0.12);
    note(c, 783.99, 'sine', 0.16, 0.18, 0.18);
    return 360;
  },
  'quiz-error': (c) => {
    note(c, 329.63, 'triangle', 0.12, 0, 0.14);
    note(c, 261.63, 'triangle', 0.1, 0.1, 0.16);
    return 260;
  },
  'badge-earned': (c) => {
    note(c, 523.25, 'sine', 0.13, 0, 0.18);
    note(c, 659.25, 'sine', 0.14, 0.1, 0.18);
    note(c, 783.99, 'sine', 0.16, 0.2, 0.18);
    note(c, 1046.5, 'sine', 0.18, 0.3, 0.28);
    note(c, 1318.5, 'triangle', 0.06, 0.15, 0.12);
    note(c, 2093.0, 'triangle', 0.08, 0.35, 0.2);
    return 600;
  },
  hover: (c) => sweep(c, 'sine', 1200, 1190, 0.06, 0.03),
  'panel-close': (c) => sweep(c, 'sine', 600, 300, 0.1, 0.14),
  'panel-open': (c) => sweep(c, 'sine', 300, 600, 0.1, 0.14),
  'quiz-open': (c) => {
    note(c, 440, 'sine', 0.12, 0, 0.1);
    note(c, 660, 'sine', 0.13, 0.08, 0.12);
    return 200;
  },
  'settings-open': (c) => sweep(c, 'triangle', 700, 690, 0.09, 0.08),
  'sidebar-toggle': (c) => sweep(c, 'sine', 280, 180, 0.12, 0.11),
  'chat-toggle': (c) => sweep(c, 'sine', 500, 350, 0.1, 0.11),
  'chat-send': (c) => sweep(c, 'sine', 350, 900, 0.1, 0.14),
  'chat-receive': (c) => {
    note(c, 880, 'sine', 0.09, 0, 0.1);
    note(c, 1100, 'sine', 0.09, 0.08, 0.12);
    return 200;
  },
  'clear-chat': (c) => sweep(c, 'triangle', 500, 150, 0.1, 0.2),
  locked: (c) => sweep(c, 'sawtooth', 120, 80, 0.12, 0.15),
  zoom: (c) => sweep(c, 'triangle', 1400, 1390, 0.06, 0.04),
  'mic-start': (c) => {
    note(c, 660, 'sine', 0.1, 0, 0.08);
    note(c, 880, 'sine', 0.11, 0.07, 0.1);
    return 170;
  },
  'mic-stop': (c) => sweep(c, 'sine', 660, 440, 0.1, 0.12),
  'filter-toggle': (c) => sweep(c, 'triangle', 900, 650, 0.07, 0.07),
  'search-ping': (c) => {
    note(c, 1318.5, 'sine', 0.1, 0, 0.08);
    note(c, 1760.0, 'sine', 0.1, 0.07, 0.1);
    return 170;
  },
  'node-add': (c) => sweep(c, 'sine', 400, 700, 0.1, 0.1),
  'edge-create': (c) => {
    note(c, 520, 'triangle', 0.09, 0, 0.07);
    note(c, 820, 'triangle', 0.09, 0.06, 0.08);
    return 140;
  },
  undo: (c) => sweep(c, 'sine', 700, 350, 0.09, 0.1),
  'tutorial-step': (c) => sweep(c, 'sine', 900, 1100, 0.08, 0.08),
  'tutorial-complete': (c) => {
    note(c, 659.25, 'sine', 0.12, 0, 0.1);
    note(c, 783.99, 'sine', 0.13, 0.08, 0.1);
    note(c, 1046.5, 'sine', 0.15, 0.16, 0.2);
    return 360;
  },
  'hint-reveal': (c) => {
    note(c, 740, 'triangle', 0.08, 0, 0.09);
    note(c, 988, 'triangle', 0.09, 0.07, 0.1);
    note(c, 1174, 'sine', 0.07, 0.14, 0.12);
    return 260;
  },
  'visit-earn': (c) => {
    note(c, 880, 'sine', 0.11, 0, 0.08);
    note(c, 1174, 'sine', 0.12, 0.07, 0.1);
    return 170;
  },
  'era-unlock': (c) => {
    note(c, 392.0, 'sine', 0.14, 0, 0.14);
    note(c, 523.25, 'sine', 0.14, 0.1, 0.14);
    note(c, 659.25, 'sine', 0.15, 0.2, 0.14);
    note(c, 783.99, 'sine', 0.17, 0.3, 0.22);
    note(c, 1046.5, 'sine', 0.18, 0.42, 0.3);
    return 700;
  },
  'node-delete': (c) => sweep(c, 'triangle', 600, 250, 0.1, 0.12),
};

export function playSfx(name: SfxName): void {
  const { sfx, sfxVolume } = useLaHistorySettings.getState();
  if (!sfx || playing) return;
  const c = getCtx();
  if (!c || !master) return;
  try {
    if (c.state === 'suspended') void c.resume();
    master.gain.value = sfxVolume;
    const dur = SOUNDS[name](c);
    playing = true;
    window.setTimeout(() => {
      playing = false;
    }, dur);
  } catch {
    playing = false;
  }
}
