'use client';

// React bridge for the ambient music engine (lib/laHistory/music.ts). Syncs
// the settings store's `music` / `musicVolume` into the imperative engine,
// starts the last-heard era when enabled, and wires browser autoplay-policy
// resume + tab-visibility pause. The actual per-era synthesis lives in the
// engine module; interaction code (MapInner marker click, tts.ts) drives
// era switching and ducking directly.

import { useEffect } from 'react';
import { Music } from '@/lib/laHistory/music';
import { useLaHistorySettings } from '@/stores/useLaHistorySettings';

export function MusicEngine() {
  const enabled = useLaHistorySettings((s) => s.music);
  const volume = useLaHistorySettings((s) => s.musicVolume);

  // Enable / disable. On enable, resume the last-heard era (Tongva by default).
  useEffect(() => {
    Music.setVolume(volume);
    Music.setEnabled(enabled);
    if (enabled) Music.play(Music.lastEra());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Live volume changes.
  useEffect(() => {
    Music.setVolume(volume);
  }, [volume]);

  // Resume a suspended context on the first user gesture (autoplay policy).
  useEffect(() => {
    function unlock() {
      Music.resumeIfSuspended();
    }
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Stop everything when the engine unmounts (route change).
  useEffect(() => {
    return () => {
      Music.setEnabled(false);
    };
  }, []);

  return null;
}
