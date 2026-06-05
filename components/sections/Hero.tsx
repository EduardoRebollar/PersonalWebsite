'use client';

import { motion, type Variants } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';
import { ShootingStars } from '@/components/ui/backgrounds/shooting-stars';
import { StarsBackground } from '@/components/ui/backgrounds/stars-background';
import { Container } from '@/components/ui/primitives/Container';
import { Eyebrow } from '@/components/ui/primitives/Eyebrow';
import { RippleLink } from '@/components/ui/cta/RippleLink';
import { ShinyButton } from '@/components/ui/cta/ShinyButton';
import { DiaTextReveal } from '@/components/ui/dia-text-reveal';
import { TextEffect } from '@/components/ui/text-effect';
import { ScrollHint } from '@/components/ui/nav/ScrollHint';
import { SplineScene } from '@/components/ui/three/SplineScene';
import { Spotlight } from '@/components/ui/three/Spotlight';
import { site } from '@/content/data/site';
import { easing } from '@/lib/motion';
import { useSceneStore } from '@/stores/useSceneStore';

// Self-hosted from /public so the scene is served from Vercel's edge (with
// long-lived caching) instead of a third-party CDN round-trip. Textures are
// embedded in the file. To refresh, re-download the source .splinecode.
const SPLINE_SCENE_URL = '/spline/hero.splinecode';

// Indigo (#818cf8 = --primary) ramp for the name's reveal band.
const NAME_BAND = ['#a5b4fc', '#818cf8', '#6366f1', '#818cf8', '#a5b4fc'];

// Staggered "rise" entrance shared by the hero CTAs (and echoed by the scroll
// hint): each item fades up in sequence — a cascade, distinct from the rest of
// the hero's motion (per-char opacity fade, the name's band sweep, the old
// simultaneous group slide). Under reduced-motion the global MotionConfig
// (reducedMotion="user", app/providers.tsx) strips the `y` transform, leaving a
// sequential opacity-only cascade. Gated on `splashDismissed` (so it plays
// *after* the intro clears, not behind the overlay) and `delayChildren` starts
// it ~2.0s later — once the name (DiaTextReveal resolves at 0.6+1.4) and the
// per-char tagline have finished revealing.
const ctaContainer: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 2.0, staggerChildren: 0.12 } },
};

const ctaItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easing.outExpo } },
};

/**
 * Hero section. Two-column layout on md+: animated copy on the left,
 * interactive Spline scene on the right. Spline is gated on the client
 * (initialized + non-mobile + WebGL2 + no reduced-motion) so heavy 3D
 * never loads for users who can't or shouldn't see it.
 */
export function Hero() {
  // Split the name so each line reveals on its own band — a single span would
  // treat the wrapped lines as one continuous sweep (box-decoration slice),
  // revealing the first name before the last instead of together.
  const [firstName = '', ...restName] = site.name.split(' ');
  const lastName = restName.join(' ');

  const initialized = useSceneStore((s) => s.initialized);
  const hasWebGL2 = useSceneStore((s) => s.hasWebGL2);
  const isMobile = useSceneStore((s) => s.isMobile);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const splashDismissed = useSceneStore((s) => s.splashDismissed);

  const showSpline = initialized && hasWebGL2 && !isMobile && !reducedMotion;

  const sectionRef = useRef<HTMLElement>(null);
  const splineHostRef = useRef<HTMLDivElement>(null);

  // Mirror Nav's contact link: scroll to the very bottom of the page (where the
  // contact section's content sits) rather than the top of the #contact anchor,
  // so this CTA lands on the same spot as the dock's contact button.
  const scrollToContact = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: reduced ? 'auto' : 'smooth',
    });
    history.replaceState(null, '', '#contact');
  }, []);

  // Mirror Nav's "Work" link: scroll so the carousel's controls row sits flush
  // at the bottom of the viewport (framing the interactive cards) rather than
  // jumping to the top of the #work anchor, matching the dock's work button.
  const scrollToWork = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;
    const target = document.getElementById('work-controls');
    if (!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GAP = 16;
    const rect = target.getBoundingClientRect();
    const top = window.scrollY + rect.bottom - window.innerHeight + GAP;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#work');
  }, []);

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
      {/* Top of the continuous starfield that runs Hero → About → Journey →
          Skills → Work → Contact. Fades in at the very top (under the nav);
          solid at the bottom so it hands off into About. Same centered
          1.5x-shell band the section's overflow-hidden crops. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[calc(var(--container-shell)*1.5)] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_100%)]"
      >
        <StarsBackground />
        <ShootingStars minDelay={400} maxDelay={1800} />
        <ShootingStars minDelay={800} maxDelay={2600} starColor="#2dd4bf" trailColor="#818cf8" />
        <ShootingStars minDelay={1200} maxDelay={3200} starColor="#fcd34d" trailColor="#818cf8" />
      </div>

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

      <Container as="div" className="relative z-10 pt-[6.5rem] pb-16 md:pb-20">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-10">
          {/* Left column — copy */}
          <div className="flex flex-col gap-10 md:gap-12">
            {/* Eyebrow + tagline reveal per-character ~1s after the splash
                dismisses (overlapping the tail of the name's DiaTextReveal
                sweep). The `fade` preset is opacity-only, so it still plays
                under OS reduced-motion. The accent dot is rendered locally
                (not via Eyebrow's `dot`) so it can fade in on the same cue. */}
            <Eyebrow>
              <span className="inline-flex items-center gap-2">
                <motion.span
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={splashDismissed ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: 1, ease: easing.outExpo }}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]"
                />
                <TextEffect
                  as="span"
                  per="char"
                  preset="fade"
                  trigger={splashDismissed}
                  delay={1}
                >
                  {site.role}
                </TextEffect>
              </span>
            </Eyebrow>

            <h1
              id="hero-heading"
              className="flex flex-col font-display text-display text-fg"
            >
              <DiaTextReveal
                text={firstName}
                colors={NAME_BAND}
                duration={1.4}
                delay={0.6}
                play={splashDismissed}
                respectReducedMotion={false}
              />
              {lastName ? (
                <DiaTextReveal
                  text={lastName}
                  colors={NAME_BAND}
                  duration={1.4}
                  delay={0.6}
                  play={splashDismissed}
                  respectReducedMotion={false}
                />
              ) : null}
            </h1>

            <p className="w-fit max-w-prose text-center font-sans text-lg leading-relaxed text-fg-mute md:text-xl">
              <TextEffect
                as="span"
                per="char"
                preset="fade"
                trigger={splashDismissed}
                delay={1}
                className="block"
              >
                Building at the intersection of
              </TextEffect>
              {/* Starts later than line 1 by (31 − 22 chars) × 0.03s stagger
                  so the shorter second line *finishes* its per-char reveal at
                  the same moment as the longer first line. */}
              <TextEffect
                as="span"
                per="char"
                preset="fade"
                trigger={splashDismissed}
                delay={1.135}
                className="block"
              >
                ML, data, and the web.
              </TextEffect>
            </p>

            <motion.div
              variants={ctaContainer}
              initial="hidden"
              animate={splashDismissed ? 'visible' : 'hidden'}
              className="mt-2 flex flex-wrap items-center gap-3"
            >
              <motion.span variants={ctaItem} className="inline-flex">
                <ShinyButton
                  href="#work"
                  onClick={scrollToWork}
                  className="group inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-fg uppercase backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface hover:text-accent focus-visible:border-accent focus-visible:text-accent"
                >
                  See work
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </ShinyButton>
              </motion.span>
              <motion.span variants={ctaItem} className="inline-flex">
                <RippleLink
                  href="#contact"
                  internal
                  onClick={scrollToContact}
                  className="cta-glow inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase transition-colors hover:text-fg focus-visible:text-fg"
                >
                  Get in touch
                </RippleLink>
              </motion.span>
            </motion.div>
          </div>

          {/* Right column — placeholder; the Spline scene is full-bleed above the section */}
          <div aria-hidden="true" className="pointer-events-none hidden md:block" />
        </div>
      </Container>

      <div className="container-shell absolute inset-x-0 bottom-4 z-20 md:bottom-5">
        <ScrollHint play={splashDismissed} />
      </div>
    </section>
  );
}
