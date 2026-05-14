'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { site } from '@/content/data/site';
import { easing } from '@/lib/motion';

/**
 * Hero section. DOM-only in Phase 1 Step 4 — the terrain world will mount
 * behind it in Step 6 via the persistent canvas in app/layout.tsx.
 *
 * Entrance sequence (skipped under prefers-reduced-motion via MotionConfig):
 *   t=0      eyebrow fade-up
 *   t=600ms  display name, word-staggered (80ms apart)
 *   t=1100ms tagline fade-up
 *   t=1400ms CTA fade-up
 *   t=1800ms scroll hint fade-in + bob
 */
export function Hero() {
  const nameWords = site.name.split(' ');

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100dvh] items-center"
    >
      <Container as="div" className="flex flex-col gap-7 pt-32 pb-32 md:gap-8 md:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easing.outExpo }}
        >
          <Eyebrow dot>{site.role}</Eyebrow>
        </motion.div>

        <h1
          id="hero-heading"
          className="font-display text-display text-fg [&_span]:inline-block"
        >
          {nameWords.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, y: '0.4em', clipPath: 'inset(0 0 100% 0)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' }}
              transition={{
                duration: 1.2,
                ease: easing.outExpo,
                delay: 0.6 + i * 0.08,
              }}
              className="mr-[0.18em] last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easing.outExpo, delay: 1.1 }}
          className="max-w-prose font-sans text-lg leading-relaxed text-fg-mute md:text-xl"
        >
          {site.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easing.outExpo, delay: 1.4 }}
          className="mt-2 flex flex-wrap items-center gap-3"
        >
          <Link
            href="#work"
            className="group inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-fg uppercase backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface hover:text-accent focus-visible:border-accent focus-visible:text-accent"
          >
            See work
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase transition-colors hover:text-fg focus-visible:text-fg"
          >
            Get in touch
          </Link>
        </motion.div>
      </Container>

      <div className="absolute right-6 bottom-8 md:right-10 md:bottom-10">
        <ScrollHint />
      </div>
    </section>
  );
}
