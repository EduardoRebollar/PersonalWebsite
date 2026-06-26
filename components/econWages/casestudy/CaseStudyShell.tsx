'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

// useLayoutEffect warns on the server; fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Root wrapper for the AI & Developer Wages broadsheet case study. Owns:
 *  - the `.ew-cs` scope (local design tokens, violet accent),
 *  - a fixed, static gradient backdrop (a nod to a regression cloud),
 *  - the `.anim-ok` motion gate: added before paint, only when the user hasn't
 *    asked for reduced motion, so the scroll-reveal pre-state never flashes and
 *    reduced-motion / no-JS visitors get fully-visible content for free.
 *
 * The page sections are server-rendered and passed as `children`, so flipping
 * the motion gate here never re-renders the report body. Mirrors the LA History
 * case study's CaseStudyShell.
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
      <div className="ew-cs-backdrop" aria-hidden="true" />
      <div ref={rootRef} className={cn('ew-cs', animOk && 'anim-ok')}>
        {children}
      </div>
    </>
  );
}
