'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import { usePathname } from 'next/navigation';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';

// useLayoutEffect warns on the server; fall back to useEffect there (mirrors the
// other case-study clients — Reveal, SplitText, WhisperText).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Hold off the first glint until the label has roughly finished fading in (the
// `.bs-divider span` / reveal fade runs ~0.6s) so the shimmer reads as a beat
// *after* the entrance, not during it. Re-entry from offscreen resumes instantly.
const REVEAL_DELAY = 650;

interface ShimmerTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Loop length, s — overrides the CSS default (`--shimmer-dur`). */
  duration?: number;
}

/**
 * Motion-primitives "TextShimmer" for the LA History broadsheet: a bright-white
 * glint sweeps across the label's `background-clip: text` glyphs. The visual is
 * pure CSS (`.bs-shimmer` + `@keyframes bsShimmer` in casestudy.css, gated on the
 * root's `.anim-ok` so reduced-motion / no-JS keep the label's normal color);
 * this component only times it. A live IntersectionObserver adds `.is-shimmering`
 * once the label scrolls in — after a short delay so it begins as the label
 * settles — and removes it while offscreen (the site's pause-when-out-of-view
 * convention). Re-runs on client-side navigation so the effect replays on every
 * arrival, mirroring Reveal.
 */
export function ShimmerText({ children, as, className, duration }: ShimmerTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    el.classList.remove('is-shimmering');
    let revealed = false;
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        const onscreen = entries.some((e) => e.isIntersecting);
        if (onscreen) {
          if (revealed) {
            el.classList.add('is-shimmering');
          } else {
            revealed = true;
            timer = window.setTimeout(() => el.classList.add('is-shimmering'), REVEAL_DELAY);
          }
        } else {
          window.clearTimeout(timer);
          el.classList.remove('is-shimmering');
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      el.classList.remove('is-shimmering');
    };
  }, [pathname]);

  const Tag = (as ?? 'span') as ElementType;
  const style = duration ? ({ '--shimmer-dur': `${duration}s` } as CSSProperties) : undefined;
  return (
    <Tag ref={ref as Ref<HTMLElement>} className={cn('bs-shimmer', className)} style={style}>
      {children}
    </Tag>
  );
}
