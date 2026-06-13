// Client-side UI preferences for the LA History demo (theme, map style,
// animations, font/marker size, audio, TTS, voice). Persisted separately from
// progress under `la-history:settings`. The audio/TTS/voice engines (Step 7)
// read these; LaHistoryApp applies theme/font/marker/animation to `.lah-root`.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type LaTheme = 'light' | 'semi-dark' | 'dark';
export type MapTile = 'voyager' | 'positron' | 'dark_matter';
export type AnimSpeed = 'normal' | 'reduced' | 'off';

export type LaSettings = {
  theme: LaTheme;
  mapTile: MapTile;
  animations: AnimSpeed;
  fontSize: number; // 12–20 px
  markerSize: number; // 24 / 32 / 44
  music: boolean;
  musicVolume: number; // 0–1
  sfx: boolean;
  sfxVolume: number; // 0–1
  ttsLang: string;
  ttsVoice: string;
  ttsRate: number;
  ttsPitch: number;
  ttsHighlight: boolean;
  voiceEnabled: boolean;
};

type SettingsStore = LaSettings & {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  update: (patch: Partial<LaSettings>) => void;
};

const INITIAL: LaSettings = {
  theme: 'light',
  mapTile: 'voyager',
  animations: 'normal',
  fontSize: 15,
  markerSize: 32,
  music: false,
  musicVolume: 0.4,
  sfx: true,
  sfxVolume: 0.8,
  ttsLang: '',
  ttsVoice: '',
  ttsRate: 0.92,
  ttsPitch: 1.0,
  ttsHighlight: false,
  voiceEnabled: true,
};

export const useLaHistorySettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...INITIAL,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      update: (patch) => set(patch),
    }),
    {
      name: 'la-history:settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): LaSettings => ({
        theme: s.theme,
        mapTile: s.mapTile,
        animations: s.animations,
        fontSize: s.fontSize,
        markerSize: s.markerSize,
        music: s.music,
        musicVolume: s.musicVolume,
        sfx: s.sfx,
        sfxVolume: s.sfxVolume,
        ttsLang: s.ttsLang,
        ttsVoice: s.ttsVoice,
        ttsRate: s.ttsRate,
        ttsPitch: s.ttsPitch,
        ttsHighlight: s.ttsHighlight,
        voiceEnabled: s.voiceEnabled,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
