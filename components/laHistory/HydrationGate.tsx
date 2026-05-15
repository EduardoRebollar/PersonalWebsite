'use client';

import type { ReactNode } from 'react';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';

/**
 * Blocks rendering until the persisted store has rehydrated from
 * localStorage. Without this gate, the first paint shows zero points and
 * an empty progress map — then flashes to the persisted state once
 * Zustand finishes reading. The gate is cheap because everything inside
 * is `'use client'` and never SSRs anyway.
 */
export function HydrationGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const hydrated = useLaHistoryStore((s) => s.hydrated);
  if (!hydrated) {
    return (
      fallback ?? (
        <div
          aria-busy
          className="grid min-h-[60vh] place-items-center font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase"
        >
          Loading your progress…
        </div>
      )
    );
  }
  return <>{children}</>;
}
