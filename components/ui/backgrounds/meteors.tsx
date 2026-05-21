'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * Meteors — CSS-animated shooting-star layer for use as a section background.
 *
 * Source: Aceternity "Meteors". Adapted for this repo:
 * - `cn` imported from `@/lib/cn` (this project has no `@/lib/utils`).
 * - Keyframes live in app/globals.css (Tailwind v4 CSS-first; no tailwind.config).
 *   The `animate-meteor-effect` utility maps to `--animate-meteor-effect` there.
 * - Trails rendered white (`bg-white/80`, gradient `from-white`) instead of slate.
 * - Gated on the scene store: returns null until `initialized` (set client-side by
 *   DeviceDetector) and skipped under `reducedMotion`. The gate doubles as the
 *   SSR fix — server and first client render both emit nothing, so the per-meteor
 *   random offsets (computed once in a useState initializer) never cause a
 *   hydration mismatch. Without the gate the global reduced-motion rule would also
 *   freeze the trails into static specks.
 * - `top`/`left` spread across the full section (the original pinned `top: 0`
 *   for a narrow card); here they fill a tall background as a meteor field.
 * - The original's static `rotate-[215deg]` class is dropped — see the className.
 */
export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const initialized = useSceneStore((s) => s.initialized);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const [styles] = useState<CSSProperties[]>(() =>
    Array.from({ length: number ?? 20 }, () => ({
      top: Math.floor(Math.random() * 100) + '%',
      left: Math.floor(Math.random() * 100) + '%',
      animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + 's',
      animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + 's',
    })),
  );

  if (!initialized || reducedMotion) return null;

  return (
    <>
      {styles.map((style, idx) => (
        <span
          key={'meteor' + idx}
          className={cn(
            // No static `rotate-*`: in Tailwind v4 it emits the standalone
            // `rotate` property, which stacks with the keyframe's own
            // `transform: rotate(215deg) …` (~430° total) and sends meteors
            // up-and-out of view. The keyframe supplies the rotation instead.
            'animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-white/80 shadow-[0_0_0_1px_#ffffff10]',
            "before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-white before:to-transparent before:content-['']",
            className,
          )}
          style={style}
        />
      ))}
    </>
  );
};
