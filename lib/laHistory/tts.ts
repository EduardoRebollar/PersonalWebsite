'use client';

// Text-to-speech engine — Web Speech API, ported from static/js/tts.js.
// Reads rate/pitch/voice from the settings store. `useTts()` gives components
// a single active-id + progress-ratio controller (one utterance at a time).

import { useCallback, useEffect, useState } from 'react';
import { useLaHistorySettings } from '@/stores/useLaHistorySettings';
import { Music } from '@/lib/laHistory/music';

function getSynth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null;
}

export function ttsSupported(): boolean {
  return !!getSynth();
}

export function isSpeaking(): boolean {
  const s = getSynth();
  return s ? s.speaking : false;
}

export function stopTts(): void {
  getSynth()?.cancel();
  Music.restore();
}

const ABBREV: [RegExp, string][] = [
  [/\bSt\.\s/g, 'Saint '],
  [/\bAve\.\b/g, 'Avenue'],
  [/\bBlvd\.\b/g, 'Boulevard'],
  [/\bMt\.\s/g, 'Mount '],
  [/\bL\.A\.\b/g, 'Los Angeles'],
  [/\bca\.\s/g, 'circa '],
];

const ONES = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function twoDigits(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n]!;
  const t = TENS[Math.floor(n / 10)]!;
  const o = ONES[n % 10]!;
  return o ? `${t}-${o}` : t;
}

function yearToWords(year: number): string {
  const hi = Math.floor(year / 100);
  const lo = year % 100;
  const hiWord = twoDigits(hi);
  if (lo === 0) return `${hiWord} hundred`;
  if (lo < 10) return `${hiWord} oh ${ONES[lo]}`;
  return `${hiWord} ${twoDigits(lo)}`;
}

function preprocess(text: string): string {
  let t = text.replace(/~/g, 'around');
  // Year ranges
  t = t.replace(/\b(\d{4})\s*[-–—]\s*(\d{4})\b/g, (_, a, b) =>
    `${yearToWords(parseInt(a))} to ${yearToWords(parseInt(b))}`,
  );
  // Four-digit years
  t = t.replace(/\b(1\d{3})\b/g, (m) => yearToWords(parseInt(m)));
  for (const [re, rep] of ABBREV) t = t.replace(re, rep);
  return t;
}

type SpeakCallbacks = { onRatio?: (r: number) => void; onEnd?: () => void };

export function speak(text: string, cb: SpeakCallbacks = {}): void {
  const synth = getSynth();
  if (!synth) return;
  synth.cancel();
  const processed = preprocess(text);
  const { ttsRate, ttsPitch, ttsVoice } = useLaHistorySettings.getState();
  const u = new SpeechSynthesisUtterance(processed);
  u.rate = ttsRate;
  u.pitch = ttsPitch;
  const voices = synth.getVoices();
  const pref = ttsVoice
    ? voices.find((v) => v.name === ttsVoice)
    : voices.find((v) => v.lang === 'en-US' && /Google|Samantha|Alex/.test(v.name));
  if (pref) u.voice = pref;

  let interval: number | null = null;
  let start = 0;

  u.onstart = () => {
    start = Date.now();
    Music.duck();
    if (cb.onRatio) {
      const cps = 14 * ttsRate;
      const estMs = Math.max((processed.length / cps) * 1000, 500);
      interval = window.setInterval(() => {
        cb.onRatio!(Math.min((Date.now() - start) / estMs, 0.99));
      }, 80);
    }
  };
  if (cb.onRatio) {
    u.onboundary = (e) => {
      if (e.name === 'word') {
        cb.onRatio!(Math.min(e.charIndex / processed.length, 0.99));
      }
    };
  }
  u.onend = () => {
    if (interval) window.clearInterval(interval);
    Music.restore();
    cb.onRatio?.(1);
    cb.onEnd?.();
  };
  synth.speak(u);
}

/** Single-active-utterance controller for TTS buttons. */
export function useTts() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ratio, setRatio] = useState(0);

  const toggle = useCallback(
    (id: string, text: string) => {
      if (activeId === id) {
        stopTts();
        setActiveId(null);
        setRatio(0);
        return;
      }
      stopTts();
      setRatio(0);
      setActiveId(id);
      speak(text, {
        onRatio: (r) => setRatio(r),
        onEnd: () => {
          setActiveId(null);
          setRatio(0);
        },
      });
    },
    [activeId],
  );

  useEffect(() => () => stopTts(), []);

  return { supported: ttsSupported(), activeId, ratio, toggle };
}
