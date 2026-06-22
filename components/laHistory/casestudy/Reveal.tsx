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
      io.disconnect();
      window.clearInterval(failsafe);
      window.removeEventListener('scroll', onScroll);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      // Bottom inset sets how deep a section must scroll before it reveals: the
      // trigger band is the top 65% of the viewport, so sections fade in a little
      // after they enter from the bottom.
      { threshold: 0.12, rootMargin: '0px 0px -35% 0px' },
    );
    io.observe(el);
    // Elements anchored at the very bottom of the page (the colophon's link
    // buttons, the final section) can never scroll their top above the observer's
    // trigger band — there isn't enough content below them to push the top past
    // the 65% line — so the observer would never fire for them. Reveal once the
    // page has scrolled to the bottom and the element is actually on-screen.
    // Guarded on "at page bottom" so the cover's scroll-hijack (held at the TOP)
    // never trips it early.
    const atPageBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    const onScreen = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };
    const onScroll = () => {
      if (atPageBottom() && onScreen()) reveal();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Fallback for the rare environment where the observer never fires (odd
    // layouts). It must NOT be a blind timer: the cover's scroll-hijack can hold
    // the reader at the top for several seconds, and a blanket timeout would then
    // flush every still-offscreen section in one go. So only reveal once the
    // element has actually scrolled to roughly the depth the observer targets (or
    // the page has bottomed out, for the unreachable bottom elements above).
    // Print (no viewport to scroll) is handled in casestudy.css.
    const failsafe = window.setInterval(() => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.65) reveal();
      else if (atPageBottom() && onScreen()) reveal();
    }, 1500);
    return () => {
      io.disconnect();
      window.clearInterval(failsafe);
      window.removeEventListener('scroll', onScroll);
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
