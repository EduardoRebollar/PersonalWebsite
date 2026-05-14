'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * Render-less component that installs Lenis smooth scroll for the page.
 *
 * Disabled when reduced motion is on (we respect the user's OS preference
 * and our own lite-mode toggle) — Lenis exposes a stop() method but it's
 * cleaner to skip initialization entirely.
 *
 * Lenis runs on requestAnimationFrame; the scroll position is written
 * synchronously to the window, so any native getBoundingClientRect / scrollY
 * code (IntersectionObserver, ScrollTrigger, our own listeners) keeps working.
 */
export function SmoothScroll() {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const liteMode = useSceneStore((s) => s.liteMode);

  useEffect(() => {
    if (reducedMotion || liteMode) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reducedMotion, liteMode]);

  return null;
}
