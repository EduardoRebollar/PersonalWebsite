'use client';

import type { ReactNode } from 'react';
import { ReducedMotionProvider } from '@/components/a11y/ReducedMotionProvider';

/**
 * Single client boundary for app-wide providers. Step 5 will add a Zustand
 * hydration boundary for useSceneStore alongside the existing motion provider.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <ReducedMotionProvider>{children}</ReducedMotionProvider>;
}
