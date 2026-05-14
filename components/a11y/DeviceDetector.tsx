'use client';

import { useEffect } from 'react';
import { getGPUTier } from 'detect-gpu';
import { useSceneStore } from '@/stores/useSceneStore';
import { detectWebGL2, mobileViewportMatcher, reducedMotionMatcher } from '@/lib/device';

/**
 * Render-less component that detects device capabilities on mount and keeps
 * the store in sync with viewport / OS changes afterward.
 *
 * Mounted once inside <Providers /> in app/providers.tsx.
 */
export function DeviceDetector() {
  const initialize = useSceneStore((s) => s.initialize);
  const setReducedMotion = useSceneStore((s) => s.setReducedMotion);
  const setIsMobile = useSceneStore((s) => s.setIsMobile);

  useEffect(() => {
    let cancelled = false;

    const motionMQ = reducedMotionMatcher();
    const mobileMQ = mobileViewportMatcher();

    async function detect() {
      const hasWebGL2 = detectWebGL2();
      const reducedMotion = motionMQ?.matches ?? false;
      const isMobile = mobileMQ?.matches ?? false;

      let gpuTier = 3;
      try {
        const result = await getGPUTier();
        if (typeof result.tier === 'number') {
          gpuTier = result.tier;
        }
      } catch {
        // detect-gpu can throw if the canvas can't be created or benchmarks
        // can't run. Fall back to a mid-tier guess so the scene still mounts
        // on capable devices.
        gpuTier = 2;
      }

      if (cancelled) return;
      initialize({ hasWebGL2, gpuTier, reducedMotion, isMobile });
    }

    void detect();

    const onMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const onMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    motionMQ?.addEventListener('change', onMotionChange);
    mobileMQ?.addEventListener('change', onMobileChange);

    return () => {
      cancelled = true;
      motionMQ?.removeEventListener('change', onMotionChange);
      mobileMQ?.removeEventListener('change', onMobileChange);
    };
  }, [initialize, setReducedMotion, setIsMobile]);

  return null;
}
