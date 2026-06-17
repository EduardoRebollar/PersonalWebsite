'use client';

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  type ElementType,
  type Ref,
} from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion';

// useLayoutEffect warns on the server; fall back to useEffect there (mirrors the
// other case-study clients — ScrollExpandCover, ScrollRevealWords).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Strip leading/trailing punctuation so emphasis matching ignores commas etc. */
const norm = (s: string) => s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();

interface WordToken {
  text: string;
  em: boolean;
}

/**
 * Split `text` into words, flagging the contiguous run that matches `emphasis`
 * (compared punctuation-insensitively) so those words render as `<em>` — the
 * accent/italic then comes from the existing `.bs-pull blockquote em` rule.
 */
function tokenize(text: string, emphasis?: string): WordToken[] {
  const words = text.split(' ');
  if (!emphasis) return words.map((t) => ({ text: t, em: false }));
  const emWords = emphasis.split(' ').map(norm);
  let start = -1;
  for (let i = 0; i + emWords.length <= words.length; i++) {
    if (emWords.every((w, j) => norm(words[i + j]!) === w)) {
      start = i;
      break;
    }
  }
  return words.map((t, i) => ({
    text: t,
    em: start >= 0 && i >= start && i < start + emWords.length,
  }));
}

interface WhisperTextProps {
  text: string;
  /** Substring rendered as `<em>` (accent); matched punctuation-insensitively. */
  emphasis?: string;
  as?: ElementType;
  className?: string;
  /** Per-word stagger, ms. */
  delay?: number;
  /** Per-word tween length, s. */
  duration?: number;
  /** Initial offset each word eases in from. */
  x?: number;
  y?: number;
  /** ScrollTrigger `start` — when the reveal fires. */
  triggerStart?: string;
}

/**
 * Word-by-word "whisper" reveal for the LA History broadsheet's large statement
 * blocks (the Wager deck + the pull-quotes). Each word fades + eases up in a
 * left-to-right stagger as it scrolls into view, once.
 *
 * Content is fully readable by default (SSR / no-JS / reduced-motion). GSAP only
 * hides the words when motion is allowed — and does so in a layout effect before
 * paint, so there's no visible flash. Re-runs on client-side navigation so the
 * entrance replays on every arrival (the cached subtree would otherwise keep the
 * finished state). Word spans reuse `.srw-word` from casestudy.css.
 */
export function WhisperText({
  text,
  emphasis,
  as,
  className,
  delay = 130,
  duration = 0.7,
  x = 0,
  y = 14,
  triggerStart = 'top 80%',
}: WhisperTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-word]');
      gsap.set(targets, { opacity: 0, x, y });
      gsap.to(targets, {
        scrollTrigger: { trigger: el, start: triggerStart, once: true },
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        ease: 'power2.out',
        stagger: delay / 1000,
      });
    }, el);

    return () => ctx.revert();
  }, [pathname, text, emphasis, delay, duration, x, y, triggerStart]);

  const Tag = (as ?? 'div') as ElementType;
  // Honor explicit hard breaks (`\n`) — each line keeps whispering in sequence;
  // the per-word index runs unbroken across lines so the stagger never resets.
  const lines = text.split('\n');
  let word = 0;
  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className}>
      {lines.map((line, li) => {
        const tokens = tokenize(line, emphasis);
        return (
          <Fragment key={li}>
            {li > 0 && <br />}
            {tokens.map((token) => {
              const key = word++;
              return (
                <span key={key} data-word className="srw-word">
                  {token.em ? <em>{token.text} </em> : `${token.text} `}
                </span>
              );
            })}
          </Fragment>
        );
      })}
    </Tag>
  );
}
