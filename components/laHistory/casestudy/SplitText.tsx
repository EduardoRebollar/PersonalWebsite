'use client';

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '@/lib/motion';

// useLayoutEffect warns on the server; fall back to useEffect there (mirrors the
// other case-study clients — WhisperText, ScrollExpandCover, ScrollRevealWords).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface SplitTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** Reveal unit. `words` for body copy; `chars` for short, punchy lines. */
  splitType?: 'words' | 'chars';
  /**
   * Float the first letter as an illuminated drop cap. The letter renders as a
   * bare leading text node so the existing `::first-letter` rule styles it (a
   * letter wrapped in an inline-block split span is unreachable by
   * `::first-letter`); only the remainder of the paragraph sweeps in.
   */
  dropCap?: boolean;
  /** Per-unit stagger, ms (reactbits SplitText default 50). */
  delay?: number;
  /** Per-unit tween length, s (reactbits default 1.25). */
  duration?: number;
  /** Distance each unit rises from, px (reactbits default 40). */
  y?: number;
  /** Long paragraphs compress their stagger to land within this many seconds. */
  maxSweep?: number;
}

/**
 * Per-unit scroll reveal for the LA History broadsheet's prose — the reactbits
 * "SplitText" effect (https://reactbits.dev/text-animations/split-text)
 * reproduced with GSAP for the tween (rise `y`px + fade, power3.out, staggered
 * left-to-right, once) but fired from an IntersectionObserver rather than GSAP
 * ScrollTrigger.
 *
 * The observer is deliberate: ZoomParallax swaps a short static grid for a 300vh
 * scroll track *after* mount, which grows the page by hundreds of vh. A
 * ScrollTrigger caches its start position at creation and would never be
 * refreshed, so any trigger below the montage fired far off-screen (and `once`
 * left it finished before it was ever seen). IO reads live geometry, so the
 * height shift can't stale it — same approach the Reveal component uses here.
 *
 * Content is fully readable by default (SSR / no-JS / reduced-motion): the
 * hidden pre-state is only set when motion is allowed, in a layout effect before
 * paint, so there's no flash. Re-runs on client-side navigation so the entrance
 * replays on every arrival. Units reuse `.srw-word` (inline-block) from
 * casestudy.css, so the print + reduced-motion fallbacks already cover them.
 */
export function SplitText({
  text,
  as,
  className,
  splitType = 'words',
  dropCap = false,
  delay = 50,
  duration = 1.25,
  y = 40,
  maxSweep = 2.2,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    // Cleanup of the observer/listeners lives outside the GSAP context (which
    // only knows how to revert tweens); `stop` is assigned once they're wired.
    let stop = () => {};

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-split]');
      if (!targets.length) return;
      // Commit the hidden pre-state before paint so nothing flashes in un-risen.
      gsap.set(targets, { opacity: 0, y });

      let done = false;
      const reveal = () => {
        if (done) return;
        done = true;
        // Reactbits uses a fixed per-unit stagger — perfect for a short
        // headline, but a long body paragraph would then sweep for several
        // seconds. Once the total would exceed `maxSweep`, distribute that fixed
        // window across every unit so long and short blocks reveal in one beat.
        const each = delay / 1000;
        const total = each * Math.max(targets.length - 1, 0);
        const stagger = total > maxSweep ? { amount: maxSweep } : each;
        gsap.to(targets, { opacity: 1, y: 0, duration, ease: 'power3.out', stagger });
        stop();
      };

      // Reveal a touch after the top edge enters (≈ ScrollTrigger's "top 80%").
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) reveal();
        },
        { threshold: 0.1, rootMargin: '0px 0px -12% 0px' },
      );
      io.observe(el);

      // Failsafe for elements that can never scroll their top into the trigger
      // band (e.g. anchored near the page bottom) — mirrors Reveal's guard.
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
      const failsafe = window.setInterval(() => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) reveal();
        else if (atPageBottom() && onScreen()) reveal();
      }, 1500);

      stop = () => {
        io.disconnect();
        window.clearInterval(failsafe);
        window.removeEventListener('scroll', onScroll);
      };
    }, el);

    return () => {
      stop();
      ctx.revert();
    };
  }, [pathname, text, splitType, dropCap, delay, duration, y, maxSweep]);

  const Tag = (as ?? 'p') as ElementType;
  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className}>
      {renderUnits(text, splitType, dropCap)}
    </Tag>
  );
}

function unit(content: string, key: number) {
  // The trailing space rides inside the span (white-space: pre on .srw-word
  // preserves it) so inter-word gaps never collapse between inline-block units.
  return (
    <span key={key} data-split="" className="srw-word">
      {content}
    </span>
  );
}

/** Split `text` into animatable inline-block spans (words or chars). */
function renderUnits(text: string, splitType: 'words' | 'chars', dropCap: boolean): ReactNode {
  // Pull the drop-cap letter out as a bare leading text node (see `dropCap`).
  let lead = '';
  let body = text;
  if (dropCap) {
    const chars = Array.from(text);
    lead = chars[0] ?? '';
    body = chars.slice(1).join('');
  }

  let key = 0;
  // Honor hard line breaks (`\n`) — each line keeps sweeping in sequence and the
  // unit index runs unbroken across lines so the stagger never resets.
  const lines = body.split('\n').map((line, li) => (
    <Fragment key={`l${li}`}>
      {li > 0 && <br />}
      {line.split(' ').map((word, wi, words) => {
        const space = wi < words.length - 1 ? ' ' : '';
        if (splitType === 'chars') {
          const chars = Array.from(word);
          return (
            <Fragment key={`w${li}-${wi}`}>
              {chars.map((ch, ci) => unit(ch + (ci === chars.length - 1 ? space : ''), key++))}
            </Fragment>
          );
        }
        return unit(word + space, key++);
      })}
    </Fragment>
  ));

  return (
    <>
      {lead}
      {lines}
    </>
  );
}
