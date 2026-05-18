'use client';

import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { BackgroundBeams } from '@/components/ui/BackgroundBeams';
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

  const sectionRef = useRef<HTMLElement>(null);
  const splineHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSpline) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!event.isTrusted) return;
      const host = splineHostRef.current;
      if (!host) return;
      const canvas = host.querySelector('canvas');
      if (!canvas) return;
      canvas.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: event.clientX,
          clientY: event.clientY,
          bubbles: false,
          pointerType: 'mouse',
        }),
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showSpline]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex items-start overflow-hidden [zoom:0.9]"
    >
      <BackgroundBeams />

      {showSpline ? (
        <div className="container-shell pointer-events-none absolute inset-x-0 inset-y-0 z-0 hidden md:block">
          <div className="relative h-full w-full">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 md:max-h-[44rem] md:w-[38rem] md:max-w-full lg:max-h-[54rem] lg:w-[46rem] [mask-image:linear-gradient(to_right,transparent_0%,black_7%),linear-gradient(to_top,transparent_0%,black_18%),linear-gradient(to_left,transparent_0%,black_7%)] [mask-composite:intersect] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_7%),linear-gradient(to_top,transparent_0%,black_18%),linear-gradient(to_left,transparent_0%,black_7%)] [-webkit-mask-composite:source-in]"
            >
              <div ref={splineHostRef} className="pointer-events-auto relative h-full w-full">
                <Spotlight className="left-0 top-0" />
                <SplineScene
                  scene={SPLINE_SCENE_URL}
                  className="h-full w-full origin-top scale-[1.1875]"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Container as="div" className="relative z-10 pt-[6.5rem] pb-32 md:pb-40">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-10">
          {/* Left column — copy */}
          <div className="flex flex-col gap-10 md:gap-12">
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
              className="w-fit max-w-prose text-center font-sans text-lg leading-relaxed text-fg-mute md:text-xl"
            >
              Building at the intersection of
              <br />
              ML, data, and the web.
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

          {/* Right column — placeholder; the Spline scene is full-bleed above the section */}
          <div aria-hidden="true" className="pointer-events-none hidden md:block" />
        </div>
      </Container>

      <div className="container-shell absolute inset-x-0 bottom-8 z-20 md:bottom-10">
        <ScrollHint />
      </div>
    </section>
  );
}
