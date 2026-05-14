'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { DeviceDetector } from '@/components/a11y/DeviceDetector';
import { SmoothScroll } from '@/components/scene/SmoothScroll';
import { ScrollDriver } from '@/components/scene/ScrollDriver';

/**
 * Single client boundary for app-wide providers.
 *
 * - MotionConfig reducedMotion="user": motion.* components auto-skip
 *   transforms when the user prefers reduced motion.
 * - DeviceDetector: runs WebGL2 + GPU tier + viewport + motion-preference
 *   detection on mount and keeps useSceneStore in sync.
 * - SmoothScroll: Lenis smooth scroll; auto-disables under reduced motion
 *   or lite mode.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <DeviceDetector />
      <SmoothScroll />
      <ScrollDriver />
      {children}
    </MotionConfig>
  );
}
