'use client';

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type Ref,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
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
  // Re-run on navigation: returning to the case study via client-side routing
  // can reuse the cached subtree with `.in` still applied from the prior visit,
  // so the entrance would never replay. Keying the effect to the pathname (and
  // resetting `.in` below) makes the reveal fire again on every arrival.
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset any prior reveal, then commit the hidden pre-state (forced reflow)
    // so re-adding `.in` actually transitions instead of being a no-op.
    el.classList.remove('in');
    void el.offsetWidth;
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
      // Bottom margin pulled in so the element must scroll well into the viewport
      // (its top past ~62% of the height) before it reveals — fires deeper in.
      { threshold: 0.12, rootMargin: '0px 0px -60% 0px' },
    );
    io.observe(el);
    // Never leave content hidden if the observer can't fire (print, odd layouts).
    // Generous so it doesn't pre-empt a slow scroll down to the element.
    const timer = window.setTimeout(reveal, 6000);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [pathname]);

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
