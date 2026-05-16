'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { RippleLink } from '@/components/ui/RippleLink';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { SplineScene } from '@/components/ui/SplineScene';
import { Spotlight } from '@/components/ui/Spotlight';
import { site } from '@/content/data/site';
import { easing } from '@/lib/motion';
import { useSceneStore } from '@/stores/useSceneStore';

const SPLINE_SCENE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * Hero section. Two-column layout on md+: animated copy on the left,
 * interactive Spline scene on the right. Spline is gated on the client
 * (initialized + non-mobile + WebGL2 + no reduced-motion) so heavy 3D
 * never loads for users who can't or shouldn't see it.
 */
export function Hero() {
  const nameWords = site.name.split(' ');

  const initialized = useSceneStore((s) => s.initialized);
  const hasWebGL2 = useSceneStore((s) => s.hasWebGL2);
  const isMobile = useSceneStore((s) => s.isMobile);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  const showSpline = initialized && hasWebGL2 && !isMobile && !reducedMotion;

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100dvh] items-center"
    >
      <Container as="div" className="pt-32 pb-32 md:pb-40">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-10">
          {/* Left column — copy */}
          <div className="flex flex-col gap-7 md:gap-8">
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
              <RippleLink
                href="#work"
                internal
                className="group inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-fg uppercase backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface hover:text-accent focus-visible:border-accent focus-visible:text-accent"
              >
                See work
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </RippleLink>
              <RippleLink
                href="#contact"
                internal
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase transition-colors hover:text-fg focus-visible:text-fg"
              >
                Get in touch
              </RippleLink>
            </motion.div>
          </div>

          {/* Right column — Spline scene (hidden on mobile / lite / reduced-motion) */}
          <div
            aria-hidden="true"
            className="relative hidden h-[420px] overflow-hidden rounded-2xl border border-hairline bg-base/40 md:block md:h-[520px]"
          >
            <Spotlight className="left-0 top-0 md:left-20" />
            {showSpline ? (
              <SplineScene scene={SPLINE_SCENE_URL} className="h-full w-full" />
            ) : null}
          </div>
        </div>
      </Container>

      <div className="absolute right-6 bottom-8 md:right-10 md:bottom-10">
        <ScrollHint />
      </div>
    </section>
  );
}
