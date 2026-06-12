'use client';

import { motion, type Variants } from 'motion/react';
import { useCallback } from 'react';
import { ShootingStars } from '@/components/ui/backgrounds/shooting-stars';
import { StarsBackground } from '@/components/ui/backgrounds/stars-background';
import { OrbitalField } from '@/components/ui/backgrounds/OrbitalField';
import { Container } from '@/components/ui/primitives/Container';
import { Eyebrow } from '@/components/ui/primitives/Eyebrow';
import { RippleLink } from '@/components/ui/cta/RippleLink';
import { ShinyButton } from '@/components/ui/cta/ShinyButton';
import { FloatingText } from '@/components/ui/floating-text';
import { TextEffect } from '@/components/ui/text-effect';
import { ScrollHint } from '@/components/ui/nav/ScrollHint';
import { site } from '@/content/data/site';
import { easing } from '@/lib/motion';
import { useSceneStore } from '@/stores/useSceneStore';

// Staggered "rise" entrance shared by the hero CTAs (and echoed by the scroll
// hint): each item fades up in sequence — a cascade, distinct from the rest of
// the hero's motion (per-char opacity fade, the name's band sweep). Under
// reduced-motion the global MotionConfig (reducedMotion="user",
// app/providers.tsx) strips the `y` transform, leaving a sequential
// opacity-only cascade. Gated on `splashDismissed` (so it plays *after* the
// intro clears, not behind the overlay) and `delayChildren` starts it at 3.2s
// — as the eyebrow and tagline finish revealing (~3.24s, see the tagline block
// below), so the buttons rise once the copy has resolved. The two items (See
// work, Get in touch) stagger 0.12s apart and run 0.7s each, settling ~4.0s;
// the scroll hint then follows (ScrollHint, delay 3.8s) as the final beat.
const ctaContainer: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 3.2, staggerChildren: 0.12 } },
};

const ctaItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easing.outExpo } },
};

// Tagline reveal — the four segments ("Four", "Fields —", "One",
// "Intersection.") fade in left-to-right as one staggered word cascade. The
// previous build composed this from four inline `TextEffect` instances, each
// wrapping its content in `AnimatePresence mode="popLayout"`; popLayout's layout
// projection is unreliable across inline siblings, leaving the non-accent
// segments stuck at opacity 0. Driving the segments from a single container
// (text always in the DOM, opacity 0 → 1) keeps the staggered reveal but
// guarantees they resolve visible. Gated on `splashDismissed`; the base
// `delayChildren` lines the line's start up with the eyebrow reveal.
const taglineContainer: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 2.04, staggerChildren: 0.18 } },
};

const taglineWord: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.4, ease: easing.outExpo } },
};

/**
 * Hero section. A centered name anchors an orbital field — four "field" nodes
 * (Economics, ML, Data, The Web) orbit on elliptical paths behind the copy
 * (`OrbitalField`), over the continuous page-wide starfield. The splash-gated
 * entrance choreography (name band-sweep, per-char eyebrow/tagline, CTA
 * cascade, scroll hint) plays once the intro overlay clears.
 */
export function Hero() {
  // Split the name so each line reveals on its own band — a single span would
  // treat the wrapped lines as one continuous sweep (box-decoration slice),
  // revealing the first name before the last instead of together.
  const [firstName = '', ...restName] = site.name.split(' ');
  const lastName = restName.join(' ');

  const splashDismissed = useSceneStore((s) => s.splashDismissed);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

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

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-svh items-center justify-center overflow-hidden"
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

      {/* Orbital field — the four field-nodes orbiting the centered name. */}
      <OrbitalField className="absolute inset-0 z-0" />

      <Container
        as="div"
        className="relative z-10 flex flex-col items-center gap-8 py-28 text-center md:gap-10"
      >
        {/* Eyebrow + tagline reveal per-character shortly after the name's
            DiaTextReveal resolves (name: delay 0.5 + duration 1.4 = 1.9s), with
            the eyebrow starting at 1.5s. The `fade` preset is opacity-only, so
            it still plays under OS reduced-motion. The accent dot is rendered
            locally (not via Eyebrow's `dot`) so it can fade in on the same
            cue. */}
        <Eyebrow className="text-[9px]">
          <span className="inline-flex items-center gap-2">
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={splashDismissed ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 1.5, ease: easing.outExpo }}
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]"
            />
            <TextEffect as="span" per="char" preset="fade" trigger={splashDismissed} delay={1.5}>
              {site.role}
            </TextEffect>
          </span>
        </Eyebrow>

        <h1
          id="hero-heading"
          className="flex flex-col items-center font-display text-display text-fg"
        >
          <FloatingText
            text={firstName}
            delay={0.5}
            bobStart={2.5}
            play={splashDismissed}
            float={!reducedMotion}
            scramble={!reducedMotion}
            scrambleStart={5.5}
          />
          {lastName ? (
            <FloatingText
              text={lastName}
              delay={0.9}
              bobStart={2.5}
              play={splashDismissed}
              float={!reducedMotion}
              scramble={!reducedMotion}
              scrambleStart={6.0}
            />
          ) : null}
        </h1>

        {/* Tagline — "Four Fields — One Intersection.", the two field-count
            keywords ("Four"/"One") in accent indigo, the rest muted. Per-char
            fade is still gated on `splashDismissed`; each segment's delay steps
            up by ~its cumulative char count × 0.03s (the char stagger) so the
            whole line reads as one continuous left-to-right sweep across the
            four inline segments rather than four separate reveals. The base
            delay (2.04) is tuned so the line's final char lands at ~3.24s — the
            same instant the longer eyebrow line ("Computer Science & Economics @
            Occidental College", 49 chars from delay 1.5) finishes, so the two
            reveals complete together. The negative `-my` pulls the tagline
            tighter to the name above and CTAs below than the column's uniform
            `gap` (flex item margins add to the gap). */}
        <motion.p
          variants={taglineContainer}
          initial="hidden"
          animate={splashDismissed ? 'visible' : 'hidden'}
          className="mx-auto -my-4 max-w-prose text-center font-sans text-[0.9rem] leading-relaxed text-fg-mute md:-my-5 md:text-base"
        >
          <motion.span variants={taglineWord} className="accent-glow text-accent">{'Four '}</motion.span>
          <motion.span variants={taglineWord} className="text-white">{'Fields — '}</motion.span>
          <motion.span variants={taglineWord} className="accent-glow text-accent">{'One '}</motion.span>
          <motion.span variants={taglineWord} className="text-white">Intersection.</motion.span>
        </motion.p>

        <motion.div
          variants={ctaContainer}
          initial="hidden"
          animate={splashDismissed ? 'visible' : 'hidden'}
          className="mt-2 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.span variants={ctaItem} className="inline-flex">
            <ShinyButton
              href="#work"
              onClick={scrollToWork}
              className="group inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-5 py-3 font-mono text-[9px] tracking-[0.18em] text-fg uppercase backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface hover:text-accent focus-visible:border-accent focus-visible:text-accent"
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
              className="cta-glow group inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-[9px] tracking-[0.18em] text-fg-mute uppercase transition-colors hover:text-fg focus-visible:text-fg"
            >
              Get in touch
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </RippleLink>
          </motion.span>
        </motion.div>

        {/* Scroll cue — sits at the bottom of the centered content (under the
            CTAs), riding the same splash-gated cascade clock. */}
        <div className="mt-2">
          <ScrollHint play={splashDismissed} />
        </div>
      </Container>
    </section>
  );
}
