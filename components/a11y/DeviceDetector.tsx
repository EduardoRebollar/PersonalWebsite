'use client';

import { useEffect } from 'react';
import { useSceneStore } from '@/stores/useSceneStore';
import { detectWebGL2, mobileViewportMatcher, reducedMotionMatcher } from '@/lib/device';

/**
 * Render-less component that detects device capabilities on mount and keeps
 * the store in sync with viewport / OS changes afterward.
 *
 * Mounted once inside <Providers /> in app/providers.tsx. Consumed by the
 * Hero to gate the Spline scene on capable, non-reduced-motion devices.
 */
export function DeviceDetector() {
  const initialize = useSceneStore((s) => s.initialize);
  const setReducedMotion = useSceneStore((s) => s.setReducedMotion);
  const setIsMobile = useSceneStore((s) => s.setIsMobile);

  useEffect(() => {
    const motionMQ = reducedMotionMatcher();
    const mobileMQ = mobileViewportMatcher();

    initialize({
      hasWebGL2: detectWebGL2(),
      gpuTier: 3,
      reducedMotion: motionMQ?.matches ?? false,
      isMobile: mobileMQ?.matches ?? false,
    });

    const onMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const onMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    motionMQ?.addEventListener('change', onMotionChange);
    mobileMQ?.addEventListener('change', onMobileChange);

    return () => {
      motionMQ?.removeEventListener('change', onMotionChange);
      mobileMQ?.removeEventListener('change', onMobileChange);
    };
  }, [initialize, setReducedMotion, setIsMobile]);

  return null;
}
