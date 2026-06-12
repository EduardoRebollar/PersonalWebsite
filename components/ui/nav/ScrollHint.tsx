'use client';

import { motion } from 'motion/react';
import { easing } from '@/lib/motion';

/**
 * Subtle "scroll" indicator that lives at the bottom of the hero.
 * Bobs gently; fades and stops at scroll > 80px.
 *
 * `play` gates the entrance on the hero's intro being dismissed. It's the final
 * beat of the entrance: its delay (3.1s) lands it *after* the CTA cascade has
 * finished (CTAs start at delayChildren 2.6 + stagger, settling ~3.4s — see
 * Hero.tsx), so the scroll cue is the last thing to fade in.
 */
export function ScrollHint({ play = true }: { play?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.7, delay: 3.1, ease: easing.outExpo }}
      className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase"
    >
      <span>scroll</span>
      <motion.span
        aria-hidden="true"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block"
      >
        ↓
      </motion.span>
    </motion.div>
  );
}
