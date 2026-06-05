'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/primitives/Container';
import { ShootingStars } from '@/components/ui/backgrounds/shooting-stars';
import { StarsBackground } from '@/components/ui/backgrounds/stars-background';
import { easing } from '@/lib/motion';
import { AboutTerminal } from './about/AboutTerminal';

/**
 * About — an interactive terminal. Visitors type commands (whoami, about,
 * skills, journey, projects, contact, resume, portrait, …) and read styled
 * output beside a HUD-framed portrait. Replaces the prior heading + paragraphs
 * + 3D photo card. Design: "B1 · Split + HUD portrait". Terminal state lives
 * in ./about/*.
 */

export function About() {
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
        <div className="tm-comment">
          {'// '}
          <b>about</b> — <span style={{ color: 'var(--fg)' }}>$ run a command to get to know me</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.8, ease: easing.outExpo }}
        >
          <AboutTerminal />
        </motion.div>
      </Container>
    </section>
  );
}
