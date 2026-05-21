'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * GradientDots — animated hexagonal dot field over soft color glows, for use as
 * a section background.
 *
 * Source: 21st.dev "Gradient Dots". Adapted for this repo:
 * - Import from `motion/react` (this repo uses `motion`, not `framer-motion`).
 * - Recolored to a white glow ramp and the source's full-spectrum `hue-rotate`
 *   sweep dropped, so the glows stay on-brand.
 * - Gated on the scene store (`initialized` + `reducedMotion`) like meteors.tsx:
 *   the position pan only animates when motion is allowed; otherwise a static frame.
 * - Two interleaved (hexagonal) dot sets: the first keeps a transparent center so
 *   the glow twinkles through; the second is a solid backgroundColor disc, so half
 *   the dots stay static — cuts the "blinking" while preserving the dot texture.
 */

type GradientDotsProps = React.ComponentProps<typeof motion.div> & {
  /** Dot size (default: 8) */
  dotSize?: number;
  /** Spacing between dots (default: 10) */
  spacing?: number;
  /** Position-pan duration in seconds (default: 30) */
  duration?: number;
  /** Background color (default: 'var(--background)') */
  backgroundColor?: string;
};

export function GradientDots({
  dotSize = 8,
  spacing = 10,
  duration = 30,
  backgroundColor = 'var(--background)',
  className,
  ...props
}: GradientDotsProps) {
  const initialized = useSceneStore((s) => s.initialized);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const animate = initialized && !reducedMotion;

  const hexSpacing = spacing * 1.732; // Hexagonal spacing

  return (
    <motion.div
      aria-hidden
      className={`absolute inset-0 ${className ?? ''}`}
      style={{
        backgroundColor,
        backgroundImage: `
          radial-gradient(circle at 50% 50%, transparent 1.2px, ${backgroundColor} 0 ${dotSize}px, transparent ${dotSize}px),
          radial-gradient(circle at 50% 50%, transparent 1.2px, ${backgroundColor} 0 ${dotSize}px, transparent ${dotSize}px),
          radial-gradient(circle at 50% 50%, #ffffff, transparent 60%),
          radial-gradient(circle at 50% 50%, #ffffff, transparent 60%),
          radial-gradient(circle at 50% 50%, #ffffff, transparent 60%),
          radial-gradient(ellipse at 50% 50%, #ffffff, transparent 60%)
        `,
        backgroundSize: `
          ${spacing}px ${hexSpacing}px,
          ${spacing}px ${hexSpacing}px,
          200% 200%,
          200% 200%,
          200% 200%,
          200% ${hexSpacing}px
        `,
        backgroundPosition: `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 0% 0%, 0% 0%, 0% 0%, 0% 0%`,
      }}
      animate={
        animate
          ? {
              backgroundPosition: [
                `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 800% 400%, 1000% -400%, -1200% -600%, 400% ${hexSpacing}px`,
                `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 0% 0%, 0% 0%, 0% 0%, 0% 0%`,
              ],
            }
          : undefined
      }
      transition={
        animate
          ? {
              backgroundPosition: {
                duration,
                ease: 'linear',
                repeat: Number.POSITIVE_INFINITY,
              },
            }
          : undefined
      }
      {...props}
    />
  );
}
