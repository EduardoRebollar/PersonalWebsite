'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { DustMotes } from './DustMotes';
import { ReadingProgress } from './ReadingProgress';

// useLayoutEffect on the server logs a warning; fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Root wrapper for the LA History case study. Owns:
 *  - the `.lah-cs` scope (local design tokens, teal accent),
 *  - the fixed backdrop (gradient tint + DustMotes drifting-particle canvas),
 *  - the `.anim-ok` motion gate: added before paint, only when the user hasn't
 *    asked for reduced motion, so the scroll-reveal pre-state never flashes and
 *    reduced-motion / no-JS visitors get fully-visible content.
 *
 * The page sections are server-rendered and passed as `children`, so flipping
 * the motion gate here never re-renders the report body.
 */
export function CaseStudyShell({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [animOk, setAnimOk] = useState(false);

  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setAnimOk(true);
  }, []);

  return (
    <>
      <ReadingProgress />
      <div className="lah-cs-backdrop" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_9%,black_90%,transparent)]"
      >
        <DustMotes className="h-full w-full" />
      </div>
      <div ref={rootRef} className={cn('lah-cs', animOk && 'anim-ok')}>
        {children}
      </div>
    </>
  );
}
