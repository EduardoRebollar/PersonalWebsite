import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * AnimatedGradientText — text filled with a continuously panning gradient.
 *
 * Source: Magic UI "Animated Gradient Text"
 * (https://magicui.design/docs/components/animated-gradient-text). Adapted:
 * - Tailwind config keyframe → `--animate-gradient-text` in app/globals.css's
 *   `@theme` block (this repo is Tailwind v4 CSS-first, no tailwind.config.ts).
 * - Default gradient retuned to the site palette and kept subtle: a soft
 *   foreground → indigo → teal → foreground sweep (no off-brand pink), so the
 *   title reads as light text with a gentle accent rather than a loud rainbow.
 * - Pure CSS, so the global prefers-reduced-motion clamp freezes it to a
 *   static gradient automatically — no JS gate needed.
 */

type AnimatedGradientTextProps = {
  children: ReactNode;
  className?: string;
  /** Gradient color stops, left to right. Defaults to a subtle indigo/teal sweep. */
  colors?: string[];
};

export function AnimatedGradientText({
  children,
  className,
  colors = ['#e6e8f0', '#818cf8', '#2dd4bf', '#e6e8f0'],
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        'animate-[var(--animate-gradient-text)] bg-clip-text text-transparent',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
        backgroundSize: 'var(--bg-size, 200%) 100%',
        // Custom prop consumed by the gradient-text keyframe.
        ['--bg-size' as string]: '200%',
      }}
    >
      {children}
    </span>
  );
}

export default AnimatedGradientText;
