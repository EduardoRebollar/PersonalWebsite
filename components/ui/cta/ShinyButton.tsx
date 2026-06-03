'use client';

import { motion, type HTMLMotionProps, type MotionProps } from 'motion/react';
import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useRipple } from '@/lib/useRipple';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * Shiny link CTA — adapted from Magic UI "Shiny Button"
 * (https://magicui.design/docs/components/shiny-button).
 *
 * Repo-specific changes vs. the source:
 * - Renders as an anchor (`motion.a`), not a `<button>`: both call sites are
 *   links (a same-page hash that's preventDefault-scrolled, and an external
 *   résumé). A plain `<a href>` is the correct fallback for both.
 * - Keeps the site's existing pill look: all shape/border/typography classes
 *   come from the caller's `className`; this component only adds the shine
 *   layers + the shared ripple click-feedback (working agreement #8).
 * - Colour: the source's `var(--primary)/10%` alpha syntax is invalid in raw
 *   inline styles, so the sweep uses `color-mix(in oklab, var(--color-accent)…)`
 *   (the site's accent already aliases to --primary). See globals.css.
 * - The `scale` entrance/tap from the source is dropped so it doesn't fight the
 *   pill's existing `hover:-translate-y-0.5` lift.
 * - The `--x` sweep is gated on `initialized && !reducedMotion` (the site's
 *   motion policy). When it isn't running, `var(--x, 100%)` parks the sweep
 *   fully off-screen, so the label is intact and the ring sits static instead
 *   of freezing mid-glint.
 * - The highlight is a full-pill diagonal sheen (an absolute overlay), not a
 *   mask on the text. Masking the text confines the sweep to the label, which
 *   on a short label (e.g. "See work") looks like it starts mid-button; a pill-
 *   sized overlay sweeps edge-to-edge regardless of how long the label is.
 */

type ShinyButtonProps = Omit<HTMLMotionProps<'a'>, 'href' | 'children'> & {
  href: string;
  // Narrow from motion's `ReactNode | MotionValue` back to ReactNode — the
  // label is plain markup and gets rendered inside a non-motion <span>.
  children?: ReactNode;
  rippleColor?: string;
  rippleDuration?: number;
};

// Diagonal sheen bar that travels across the whole pill as --x animates
// 100% -> -100%. A thin bright band, transparent on either side, so it reads as
// light glinting off the surface. Sits above the label (pointer-events-none).
const SHEEN_GRADIENT =
  'linear-gradient(-75deg, ' +
  'transparent calc(var(--x, 100%) + 15%), ' +
  'color-mix(in oklab, #fff 22%, transparent) calc(var(--x, 100%) + 25%), ' +
  'transparent calc(var(--x, 100%) + 35%))';

// Animated accent ring. The two-layer `exclude` mask paints only the 1px pad
// ring (content-box subtracted from border-box), so the gradient reads as a
// glinting border rather than filling the pill.
const RING_GRADIENT =
  'linear-gradient(-75deg, ' +
  'color-mix(in oklab, var(--color-accent) 8%, transparent) calc(var(--x, 100%) + 20%), ' +
  'color-mix(in oklab, var(--color-accent) 55%, transparent) calc(var(--x, 100%) + 25%), ' +
  'color-mix(in oklab, var(--color-accent) 8%, transparent) calc(var(--x, 100%) + 100%))';
const RING_MASK =
  'linear-gradient(#000, #000) content-box exclude, linear-gradient(#000, #000)';

// Smooth, even sweep, expressed as an explicit keyframe array.
//
// Why keyframes and not `initial: 100% -> animate: -100%`: the sweep is gated
// on `initialized && !reducedMotion`, which only flips true *after* mount, so
// `initial` (mount-only) is already gone by the time the animation turns on.
// Motion would then start from the element's current `--x` (unset ≈ 0%), which
// drops the band in the middle of the button instead of sweeping in from the
// edge. A `['100%', '-100%']` keyframe array pins the start of every pass to
// 100% (off-screen right) regardless of the live value. Both ends are
// off-screen, so the loop's reset isn't visible; repeatDelay paces the passes.
const shineMotion = {
  animate: { '--x': ['100%', '-100%'] },
  transition: {
    repeat: Infinity,
    repeatType: 'loop',
    repeatDelay: 1.6,
    duration: 1.1,
    ease: 'linear',
  },
} satisfies MotionProps;

export const ShinyButton = forwardRef<HTMLAnchorElement, ShinyButtonProps>(function ShinyButton(
  { href, className, children, onClick, rippleColor, rippleDuration, ...rest },
  ref,
) {
  const { trigger, layer } = useRipple({ duration: rippleDuration, color: rippleColor });

  const initialized = useSceneStore((s) => s.initialized);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const animateShine = initialized && !reducedMotion;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trigger(event);
    onClick?.(event);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={handleClick}
      className={cn('relative isolate overflow-hidden', className)}
      {...(animateShine ? shineMotion : {})}
      {...rest}
    >
      {/* Label (+ any trailing icon). */}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>

      {/* Full-pill sheen sweep — sits above the label so light reads as passing
          over it; clipped to the pill by the host's overflow-hidden. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 block rounded-[inherit]"
        style={{ backgroundImage: SHEEN_GRADIENT }}
      />

      {/* Animated accent ring, drawn just inside the pill's static hairline. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 block rounded-[inherit] p-px"
        style={{ mask: RING_MASK, WebkitMask: RING_MASK, backgroundImage: RING_GRADIENT }}
      />

      {layer}
    </motion.a>
  );
});
