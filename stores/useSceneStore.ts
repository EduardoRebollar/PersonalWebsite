import { create } from 'zustand';

/**
 * Shared device + intro state. DOM components subscribe to this to gate
 * motion-heavy surfaces (animated backgrounds, the skill orbit, the Spline
 * backdrop on /work pages) on capability + reduced-motion, and to defer the
 * Hero reveal until the SpiralSplash intro is dismissed.
 *
 * The old R3F-era lite-mode / GPU-tier / scroll-section fields were removed
 * once the terrain canvas was retired — nothing read them.
 */

export type SceneState = {
  initialized: boolean;
  hasWebGL2: boolean;
  isMobile: boolean;
  reducedMotion: boolean;
  /** Flipped true once the SpiralSplash "Enter" is dismissed. Lets the Hero
   *  defer its name reveal until the intro overlay clears. */
  splashDismissed: boolean;

  initialize: (params: {
    hasWebGL2: boolean;
    isMobile: boolean;
    reducedMotion: boolean;
  }) => void;
  setReducedMotion: (value: boolean) => void;
  setIsMobile: (value: boolean) => void;
  dismissSplash: () => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  initialized: false,
  hasWebGL2: false,
  isMobile: false,
  reducedMotion: false,
  splashDismissed: false,

  initialize: (params) => set({ ...params, initialized: true }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setIsMobile: (isMobile) => set({ isMobile }),
  dismissSplash: () => set({ splashDismissed: true }),
}));
