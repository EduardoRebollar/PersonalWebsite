'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * Lenis smooth scroll + GSAP integration.
 *
 * - Lenis drives the actual scroll position via RAF.
 * - GSAP's ticker is the single RAF loop (Lenis hands its update to it).
 * - lenis.on('scroll', ScrollTrigger.update) keeps ScrollTrigger in lockstep
 *   with Lenis so scroll-driven animations are jitter-free.
 * - Disabled under reduced motion / lite mode (native scroll takes over).
 */
export function SmoothScroll() {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const liteMode = useSceneStore((s) => s.liteMode);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion || liteMode) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    function update(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [reducedMotion, liteMode]);

  return null;
}
