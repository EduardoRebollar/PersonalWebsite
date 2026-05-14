'use client';

import { motion } from 'motion/react';
import { easing } from '@/lib/motion';

/**
 * Subtle "scroll" indicator that lives at the bottom of the hero.
 * Bobs gently; fades and stops at scroll > 80px.
 */
export function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.8, ease: easing.outExpo }}
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
