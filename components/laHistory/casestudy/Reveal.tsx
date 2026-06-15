'use client';

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type Ref,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type RevealProps = {
  as?: ElementType;
  className?: string;
  /** Children cascade in one-by-one instead of as a single block. */
  stagger?: boolean;
  /** `img` swaps the fade-up for an opacity/scale settle + Ken-Burns. */
  variant?: 'img';
  id?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Scroll-reveal wrapper for the LA History broadsheet. Content is visible by
 * default (see casestudy.css) — the hidden pre-state only engages once the
 * `.lah-cs` root gains `.anim-ok` (added by CaseStudyShell before paint, and
 * only when prefers-reduced-motion is unset). This component just adds `.in`
 * once the element scrolls into view; a safety timeout guarantees nothing stays
 * hidden even if the observer never fires.
 */
export function Reveal({
  as,
  className,
  stagger,
  variant,
  id,
  style,
  children,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      el.classList.add('in');
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal();
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    // Never leave content hidden if the observer can't fire (print, odd layouts).
    const timer = window.setTimeout(reveal, 1600);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      id={id}
      style={style}
      className={cn(stagger ? 'reveal-stagger' : 'reveal', variant && `r-${variant}`, className)}
    >
      {children}
    </Tag>
  );
}
