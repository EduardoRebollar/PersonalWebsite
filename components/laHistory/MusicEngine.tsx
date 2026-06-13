'use client';

// Ambient drone synthesizer for the demo. Web Audio API only — no audio
// files. Opt-in (see CLAUDE.md memory: user has OS-level reduced motion
// and that signal also gates audio autoplay). Stays silent until enabled
// in Settings and unmutes on the first user gesture so browser autoplay
// policy is satisfied.
//
// Descoped from the original Flask app: per-era oscillator banks. This
// version is one steady triad with a slow LFO. Honest to the spirit of
// "ambient backdrop" without porting the full 291 LOC music.js.

import { useEffect, useRef } from 'react';
import { useLaHistorySettings } from '@/stores/useLaHistorySettings';

type EngineState = {
  ctx: AudioContext;
  master: GainNode;
  voices: { osc: OscillatorNode; gain: GainNode }[];
  lfo: OscillatorNode;
  lfoGain: GainNode;
};

function startEngine(volume: number): EngineState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- AudioContext webkit fallback
  const Ctor = (window.AudioContext ?? (window as any).webkitAudioContext) as
    | typeof AudioContext
    | undefined;
  if (!Ctor) throw new Error('Web Audio not supported');
  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Root D2 + perfect fifth + low octave — a slow drone with detuned tops.
  const FREQS = [73.42, 110.0, 36.71];
  const voices = FREQS.map((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 2 ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    osc.detune.value = (i - 1) * 6;
    const gain = ctx.createGain();
    gain.gain.value = i === 2 ? 0.4 : 0.22;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    return { osc, gain };
  });

  // LFO modulates the master gain ±20% so the drone breathes.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();

  // Fade in to target volume over 1.2s.
  master.gain.setTargetAtTime(volume * 0.18, ctx.currentTime, 0.4);

  return { ctx, master, voices, lfo, lfoGain };
}

function stopEngine(engine: EngineState) {
  const { ctx, master, voices, lfo } = engine;
  const now = ctx.currentTime;
  master.gain.setTargetAtTime(0, now, 0.3);
  // Hard-stop everything ~1s later so it's truly silent.
  window.setTimeout(() => {
    voices.forEach((v) => {
      try {
        v.osc.stop();
        v.osc.disconnect();
        v.gain.disconnect();
      } catch {
        // already stopped
      }
    });
    try {
      lfo.stop();
      lfo.disconnect();
    } catch {
      // already stopped
    }
    void ctx.close();
  }, 1000);
}

export function MusicEngine() {
  const enabled = useLaHistorySettings((s) => s.music);
  const volume = useLaHistorySettings((s) => s.musicVolume);
  const engineRef = useRef<EngineState | null>(null);

  // Start/stop on enable toggle.
  useEffect(() => {
    if (!enabled) {
      if (engineRef.current) {
        stopEngine(engineRef.current);
        engineRef.current = null;
      }
      return;
    }
    if (engineRef.current) return;
    try {
      engineRef.current = startEngine(volume);
    } catch {
      // Web Audio unsupported — silently no-op.
    }
    return () => {
      if (engineRef.current) {
        stopEngine(engineRef.current);
        engineRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Volume changes — adjust master gain on the live engine.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.master.gain.setTargetAtTime(
      volume * 0.18,
      engine.ctx.currentTime,
      0.2,
    );
  }, [volume]);

  // First user gesture: resume the audio context if it's suspended.
  useEffect(() => {
    function unlock() {
      const ctx = engineRef.current?.ctx;
      if (ctx && ctx.state === 'suspended') {
        void ctx.resume();
      }
    }
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return null;
}
