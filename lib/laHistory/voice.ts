'use client';

// Voice input — Web Speech recognition, ported from static/js/voice.js.
// `useVoiceInput(onResult)` powers the chat mic buttons.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLaHistorySettings } from '@/stores/useLaHistorySettings';
import { playSfx } from './sfx';

type RecognitionAlternative = { transcript: string };
type RecognitionResult = { isFinal: boolean; 0: RecognitionAlternative };
type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
};
interface RecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => RecognitionLike;

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function voiceSupported(): boolean {
  return getCtor() !== null;
}

export type VoiceState = 'idle' | 'listening' | 'error';

export function useVoiceInput(onResult: (text: string) => void) {
  const enabled = useLaHistorySettings((s) => s.voiceEnabled);
  const [state, setState] = useState<VoiceState>('idle');
  const recRef = useRef<RecognitionLike | null>(null);
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  });

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor || !enabled) return;
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {
        // ignore
      }
      recRef.current = null;
      setState('idle');
      return;
    }
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r?.isFinal) text += r[0].transcript;
      }
      if (text.trim()) onResultRef.current(text.trim());
    };
    rec.onerror = () => {
      setState('error');
      window.setTimeout(() => setState('idle'), 2000);
    };
    rec.onend = () => {
      recRef.current = null;
      setState((s) => (s === 'error' ? s : 'idle'));
      playSfx('mic-stop');
    };
    recRef.current = rec;
    setState('listening');
    playSfx('mic-start');
    try {
      rec.start();
    } catch {
      setState('error');
    }
  }, [enabled]);

  useEffect(
    () => () => {
      try {
        recRef.current?.stop();
      } catch {
        // ignore
      }
    },
    [],
  );

  return { supported: voiceSupported() && enabled, state, start };
}
