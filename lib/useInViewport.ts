'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * useInViewport — reports whether `ref`'s element currently intersects the
 * viewport, so always-on animation loops (canvas starfields, the skill orbit,
 * the hero beams) can pause their `requestAnimationFrame` work while scrolled
 * offscreen. Mirrors the IntersectionObserver pause pattern proven in
 * `components/ui/backgrounds/OrbitalField.tsx`.
 *
 * The caller owns the ref (its <canvas> / <svg> / container), so this returns a
 * plain boolean and never returns a ref — keeping the `react-hooks/refs` rule
 * happy. Defaults to `true` until the observer first reports, so content that's
 * visible at initial paint animates immediately rather than flashing frozen.
 */
export function useInViewport<T extends Element>(
  ref: RefObject<T | null>,
  options?: IntersectionObserverInit,
): boolean {
  const [inView, setInView] = useState(true);
  const rootMargin = options?.rootMargin;
  // Narrow to a single number so the dep array stays stable for the common case
  // (callers pass a scalar threshold or none); array thresholds aren't needed here.
  const threshold = typeof options?.threshold === 'number' ? options.threshold : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold]);

  return inView;
}
