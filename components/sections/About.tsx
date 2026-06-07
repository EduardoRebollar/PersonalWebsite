'use client';

import { useRef } from 'react';
import { useInView } from 'motion/react';
import { Container } from '@/components/ui/primitives/Container';
import { ShootingStars } from '@/components/ui/backgrounds/shooting-stars';
import { StarsBackground } from '@/components/ui/backgrounds/stars-background';
import { cn } from '@/lib/cn';
import { AboutTerminal } from './about/AboutTerminal';

/**
 * About — an interactive terminal. Visitors type commands (whoami, about,
 * skills, journey, projects, contact, resume, portrait, …) and read styled
 * output beside a HUD-framed portrait. Replaces the prior heading + paragraphs
 * + 3D photo card. Design: "B1 · Split + HUD portrait". Terminal state lives
 * in ./about/*.
 */

export function About() {
  // In-view toggle drives the scanline-sweep entrance. `useInView` is a plain
  // IntersectionObserver wrapper (unaffected by MotionConfig); the actual motion
  // lives in CSS, gated by prefers-reduced-motion in globals.css.
  //
  // The `-30%` bottom root-margin pulls the trigger line up to 70% of viewport
  // height, so the sweep only fires once the section is genuinely scrolled into
  // view — never on page load while it's still peeking at the bottom edge.
  const revealRef = useRef<HTMLDivElement>(null);
  const inView = useInView(revealRef, { once: true, margin: '0px 0px -30% 0px' });

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="about-terminal relative pt-24 pb-12 md:pt-32 md:pb-16"
    >
      {/* Mid-chain section of the continuous starfield (Hero → About → Journey
          → …): solid at both edges, handing off from Hero above and into Journey
          below. The fade-in into the nav now lives on Hero. Same centered
          1.5x-shell band the band's overflow-hidden crops. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[calc(var(--container-shell)*1.5)] overflow-hidden"
      >
        <StarsBackground />
        <ShootingStars minDelay={400} maxDelay={1800} />
        <ShootingStars minDelay={800} maxDelay={2600} starColor="#2dd4bf" trailColor="#818cf8" />
        <ShootingStars minDelay={1200} maxDelay={3200} starColor="#fcd34d" trailColor="#818cf8" />
      </div>

      {/* Visible "heading" is the mono comment below; this names the region. */}
      <h2 id="about-heading" className="sr-only">
        About
      </h2>

      <Container>
        {/* `.is-on` (added once the section scrolls into view) drives the
            scanline sweep: a bright accent bar sweeps down the terminal and the
            content develops in its wake, then the comment + HUD portrait fade
            in. All choreography is in CSS (globals.css), scoped under
            .about-terminal and gated on prefers-reduced-motion: no-preference. */}
        <div ref={revealRef} className={cn('about-reveal', inView && 'is-on')}>
          <div className="tm-comment">
            {'// '}
            <b>about</b> — <span style={{ color: 'var(--fg)' }}>$ run a command to get to know me</span>
          </div>

          <AboutTerminal start={inView} />
        </div>
      </Container>
    </section>
  );
}
