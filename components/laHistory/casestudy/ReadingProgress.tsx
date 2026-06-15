'use client';

import { motion, useScroll, useReducedMotion } from 'motion/react';

/**
 * Thin teal scroll-progress bar pinned to the top of the viewport, tracking the
 * read position through the whole broadsheet. Scroll-linked transform (no rAF),
 * so it stays compositor-cheap. Hidden entirely under reduced motion.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="lah-cs-progress"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
