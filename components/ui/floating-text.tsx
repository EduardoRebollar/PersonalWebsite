'use client';

import { motion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/lib/cn';
import { easing } from '@/lib/motion';
import { useInViewport } from '@/lib/useInViewport';

// Deterministic pseudo-random in [0, 1) from an integer seed. Used so each
// letter gets a stable amplitude / rotation / phase that's identical on the
// server and client (no hydration mismatch) yet varies letter-to-letter for an
// organic, non-synchronized float.
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Matrix-flavoured glyph set the decode wave flickers through — half-width
// katakana + digits + a few code symbols.
const SCRAMBLE_GLYPHS = 'アカサタナハマヤラワガギグゲゴ0123456789#%&*<>+=¦｜/';

function randScramble(): string {
  return SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0]!;
}

// Decode-wave timing (ms). A wave sweeps left→right: each letter flickers
// through random glyphs for `SCRAMBLE_DUR`, with its start staggered by
// `STAGGER`, then snaps back to the real character. `PERIOD` is the gap between
// successive wave starts.
const STAGGER = 95;
const SCRAMBLE_DUR = 450;
const PERIOD = 7000;
// Probability a scrambling letter re-rolls its glyph on a given frame. Lower =
// calmer, more deliberate flicker (vs. a frantic blur at ~60fps).
const REROLL = 0.28;

export interface FloatingTextProps {
  /** The word to render. Split per-character; each letter floats on its own. */
  text: string;
  /**
   * Entrance gate. While `false` the letters sit hidden (offset + transparent);
   * flipping `true` plays the staggered indigo→white rise, after which the
   * continuous float begins. Mirrors `DiaTextReveal`'s `play` (splashDismissed).
   */
  play: boolean;
  /**
   * When `false`, the continuous per-letter float is suppressed (letters reveal
   * then hold still). Drive from `useSceneStore.reducedMotion`.
   */
  float?: boolean;
  /** Base entrance delay (seconds) before this word's first letter rises. */
  delay?: number;
  /**
   * Absolute time (seconds, from `play`) at which the continuous bob begins.
   * Lets the caller hold the letters still until the rest of the section has
   * finished revealing. Per-letter phase is layered on top. Defaults to just
   * after each letter's own entrance.
   */
  bobStart?: number;
  /**
   * When `true`, a periodic "decode" wave flickers each letter through Matrix
   * glyphs (indigo) before resolving back to the real character — name → code →
   * name. Drive from `!reducedMotion`. Runs imperatively (no per-frame React
   * re-render) and pauses while scrolled offscreen.
   */
  scramble?: boolean;
  /** Seconds (from `play`) before the first decode wave fires. */
  scrambleStart?: number;
  className?: string;
  charClassName?: string;
}

/**
 * Renders a word as a row of independently-animated letters: each rises in on a
 * staggered indigo→white cue (the hero's prior `DiaTextReveal` band-sweep
 * identity, re-expressed per-letter), holds a fixed, per-letter tilt, then bobs
 * straight up and down. With `scramble`, a periodic decode wave also sweeps
 * across — letters flicker through Matrix glyphs then resolve back to the name
 * (name → code → name). The letters are spaced apart (`gap`) to give each room
 * to bob. The visible glyphs are `aria-hidden`; the wrapping span carries the
 * real `aria-label`, so AT reads the whole word.
 *
 * Decode wave inspired by soulwire's "Text Scramble Effect"
 * (https://codepen.io/soulwire/pen/mErPAK): glyphs re-roll each frame within a
 * staggered window, then snap to the target character.
 */
export function FloatingText({
  text,
  play,
  float = true,
  delay = 0,
  bobStart,
  scramble = false,
  scrambleStart = 5.5,
  className,
  charClassName,
}: FloatingTextProps) {
  const chars = useMemo(() => text.split(''), [text]);

  const wrapRef = useRef<HTMLSpanElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inView = useInViewport(wrapRef);

  // Periodic decode wave — driven imperatively (textContent writes) so it never
  // re-renders the tree, and gated on play + scramble + in-view (the repo's
  // always-on-loop convention). Each wave resets the letters to their real
  // characters on completion and on cleanup, so React's view stays consistent.
  useEffect(() => {
    if (!play || !scramble || !inView) return;

    const resolved = (i: number) => (chars[i] === ' ' ? ' ' : chars[i]!);
    const settleAll = () => {
      for (let i = 0; i < chars.length; i++) {
        const el = charRefs.current[i];
        if (!el) continue;
        el.textContent = resolved(i);
        el.style.color = '';
      }
    };

    let raf = 0;
    let timer = 0;
    let cancelled = false;

    const runPass = () => {
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = now - start;
        let done = true;
        for (let i = 0; i < chars.length; i++) {
          const el = charRefs.current[i];
          if (!el) continue;
          if (chars[i] === ' ') continue;
          const s = i * STAGGER;
          const e = s + SCRAMBLE_DUR;
          if (t < s) {
            done = false; // wave hasn't reached this letter yet — leave it readable
          } else if (t < e) {
            done = false;
            if (Math.random() < REROLL) el.textContent = randScramble();
            el.style.color = 'var(--color-primary)';
          } else if (el.style.color) {
            el.textContent = resolved(i);
            el.style.color = '';
          }
        }
        if (done) {
          settleAll();
          const elapsed = performance.now() - start;
          timer = window.setTimeout(runPass, Math.max(0, PERIOD - elapsed));
        } else {
          raf = requestAnimationFrame(tick);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    timer = window.setTimeout(runPass, scrambleStart * 1000);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      settleAll();
    };
  }, [play, scramble, inView, chars, scrambleStart]);

  return (
    <span ref={wrapRef} role="img" className={cn('inline-flex gap-[0.16em]', className)} aria-label={text}>
      {chars.map((ch, i) => {
        const seed = i + 1;
        // Per-letter motion profile — stable across renders, varied per index.
        const tilt = (rand(seed * 2.3) - 0.5) * 2 * 6; // fixed tilt: -6..6deg
        const amp = 8 + rand(seed) * 8; // vertical bob: 8–16px
        const dur = 2.6 + rand(seed * 3.1) * 1.6; // loop length: 2.6–4.2s
        const phase = rand(seed * 4.7) * 1.4; // bob start offset: 0–1.4s

        const entranceDelay = delay + i * 0.06;
        // Begin the bob at `bobStart` (once the section has revealed) — or, if
        // unset, just as this letter finishes rising (0.8s entrance). Its own
        // phase is layered on so the row never bobs in lockstep.
        const bobDelay = (bobStart ?? entranceDelay + 0.8) + phase;

        const animateBob = play && float;

        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className="inline-block"
            initial={{ opacity: 0, y: 30, color: 'var(--color-primary)' }}
            animate={
              play
                ? { opacity: 1, y: 0, color: 'var(--foreground)' }
                : { opacity: 0, y: 30, color: 'var(--color-primary)' }
            }
            transition={{ duration: 0.8, ease: easing.outExpo, delay: entranceDelay }}
          >
            <motion.span
              ref={(el) => {
                charRefs.current[i] = el;
              }}
              className={cn('inline-block', charClassName)}
              // `rotate` holds a single (constant) value — the letter's locked
              // tilt — while `y` keyframes drive the continuous bob.
              animate={animateBob ? { y: [0, -amp, 0], rotate: tilt } : { y: 0, rotate: tilt }}
              transition={
                animateBob
                  ? {
                      y: {
                        duration: dur,
                        repeat: Infinity,
                        repeatType: 'loop',
                        ease: 'easeInOut',
                        delay: bobDelay,
                      },
                      rotate: { duration: 0.8, ease: easing.outExpo, delay: entranceDelay },
                    }
                  : { duration: 0.4, ease: easing.outExpo }
              }
            >
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          </motion.span>
        );
      })}
    </span>
  );
}
