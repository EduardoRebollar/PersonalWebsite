'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { ReducedMotionProvider } from '@/components/a11y/ReducedMotionProvider';

/**
 * Single client boundary for app-wide providers.
 *
 * - MotionConfig reducedMotion="user": all motion components auto-skip
 *   transforms and instant-snap when the user prefers reduced motion.
 * - ReducedMotionProvider: separate context our own components can read.
 *   Step 5 folds in a Zustand hydration boundary for useSceneStore.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ReducedMotionProvider>{children}</ReducedMotionProvider>
    </MotionConfig>
  );
}
