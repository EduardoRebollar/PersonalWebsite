import { create } from 'zustand';

/**
 * Shared scene state. Both DOM and the 3D canvas subscribe to this store.
 *
 * Lite-mode logic:
 *   - Auto: enabled when WebGL2 is missing, viewport is mobile, or GPU
 *     tier ≤ 1. Reduced-motion is *not* a lite-mode trigger — the canvas
 *     renders, but motion-sensitive subsystems (Lenis smooth scroll,
 *     MotionConfig, CameraRig parallax) self-suppress on their own.
 *   - User toggle (LiteModeToggle): flips liteMode AND marks the choice as
 *     overridden, so subsequent OS / viewport changes won't undo it.
 *
 * activeSection is wired in Phase 2 (scroll-linked); kept here so DOM and
 * scene components share the same source of truth from the start.
 */

export type SceneState = {
  initialized: boolean;
  hasWebGL2: boolean;
  isMobile: boolean;
  gpuTier: number;
  reducedMotion: boolean;
  liteMode: boolean;
  liteModeOverridden: boolean;
  activeSection: string;
  sectionProgress: number;

  initialize: (params: {
    hasWebGL2: boolean;
    isMobile: boolean;
    gpuTier: number;
    reducedMotion: boolean;
  }) => void;
  setReducedMotion: (value: boolean) => void;
  setIsMobile: (value: boolean) => void;
  toggleLiteMode: () => void;
  setLiteMode: (value: boolean) => void;
  setActiveSection: (slug: string) => void;
  setSectionProgress: (progress: number) => void;
};

function computeAutoLite(params: {
  hasWebGL2: boolean;
  isMobile: boolean;
  gpuTier: number;
}): boolean {
  return !params.hasWebGL2 || params.isMobile || params.gpuTier <= 1;
}

export const useSceneStore = create<SceneState>((set) => ({
  initialized: false,
  hasWebGL2: false,
  isMobile: false,
  gpuTier: 3,
  reducedMotion: false,
  liteMode: false,
  liteModeOverridden: false,
  activeSection: 'hero',
  sectionProgress: 0,

  initialize: (params) =>
    set({
      ...params,
      initialized: true,
      liteMode: computeAutoLite(params),
      liteModeOverridden: false,
    }),

  setReducedMotion: (reducedMotion) => set({ reducedMotion }),

  setIsMobile: (isMobile) =>
    set((state) => {
      if (state.liteModeOverridden) {
        return { isMobile };
      }
      return {
        isMobile,
        liteMode: computeAutoLite({ ...state, isMobile }),
      };
    }),

  toggleLiteMode: () =>
    set((state) => ({
      liteMode: !state.liteMode,
      liteModeOverridden: true,
    })),

  setLiteMode: (liteMode) =>
    set({
      liteMode,
      liteModeOverridden: true,
    }),

  setActiveSection: (slug) => set({ activeSection: slug }),

  setSectionProgress: (progress) => set({ sectionProgress: progress }),
}));

/**
 * Selectors that derive UI-relevant state without subscribing components to
 * every store change.
 */
export const selectShouldRenderScene = (state: SceneState): boolean =>
  state.initialized && !state.liteMode && state.hasWebGL2;
