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
  id?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Scroll-reveal wrapper for the AI & Developer Wages broadsheet. Content is
 * visible by default (see casestudy.css) — the hidden pre-state only engages
 * once the `.ew-cs` root gains `.anim-ok` (added by CaseStudyShell before paint,
 * and only when prefers-reduced-motion is unset). This component just adds `.in`
 * once the element scrolls into view; a failsafe guarantees nothing stays hidden
 * even if the observer never fires. Mirrors the LA History case study's Reveal.
 */
export function Reveal({ as, className, stagger, id, style, children }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // Re-run on navigation: a cached subtree can return with `.in` still applied
  // from a prior visit, so keying the effect to the pathname (and resetting
  // `.in` below) makes the entrance replay on every arrival.
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('in');
    void el.offsetWidth;
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      el.classList.add('in');
      io.disconnect();
      window.clearInterval(failsafe);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    const failsafe = window.setInterval(() => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) reveal();
    }, 1500);
    return () => {
      io.disconnect();
      window.clearInterval(failsafe);
    };
  }, [pathname]);

  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      id={id}
      style={style}
      className={cn(stagger ? 'reveal-stagger' : 'reveal', className)}
    >
      {children}
    </Tag>
  );
}
