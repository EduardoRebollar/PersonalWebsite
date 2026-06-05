'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/primitives/Container';
import { Heading } from '@/components/ui/primitives/Heading';
import { OrbitingSkills } from '@/components/ui/orbiting-skills';
import { SkillMarquee } from '@/components/ui/skill-marquee';
import { ShootingStars } from '@/components/ui/backgrounds/shooting-stars';
import { StarsBackground } from '@/components/ui/backgrounds/stars-background';
import { skillHighlights, skills } from '@/content/data/skills';
import { easing } from '@/lib/motion';
import type { SkillGroup } from '@/types/content';

const TECHNICAL_LABELS = new Set(['Languages', 'ML / Data', 'Frameworks', 'Dev Tools']);
const PRODUCTIVITY_LABELS = new Set([
  'Microsoft',
  'Google Workspace',
  'Communication',
  'Network & Creative',
]);

function OrbitGroup({
  label,
  groups,
  delay = 0,
}: {
  label: string;
  groups: SkillGroup[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.8, ease: easing.outExpo, delay }}
      className="flex flex-col items-center gap-3"
    >
      <h3 className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">{label}</h3>
      <OrbitingSkills groups={groups} maxSize={520} />
    </motion.div>
  );
}

export function Skills() {
  const technicalGroups = skills.filter((g) => TECHNICAL_LABELS.has(g.label));
  const productivityGroups = skills.filter((g) => PRODUCTIVITY_LABELS.has(g.label));

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative isolate overflow-hidden pt-3 pb-6 md:pt-4 md:pb-8"
    >
      {/* Same starfield as the Journey section, extended down through Skills so
          the field reads as one continuous sky. Solid at both edges — it joins
          Journey above and hands off into Projects below, which extends the same
          field down before fading out into Contact. Same centered 1.5x-shell
          band the section's overflow-hidden crops. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[calc(var(--container-shell)*1.5)] overflow-hidden"
      >
        <StarsBackground />
        <ShootingStars minDelay={400} maxDelay={1800} />
        <ShootingStars minDelay={800} maxDelay={2600} starColor="#2dd4bf" trailColor="#818cf8" />
        <ShootingStars minDelay={1200} maxDelay={3200} starColor="#fcd34d" trailColor="#818cf8" />
      </div>

      <Container className="relative z-10 flex flex-col gap-3">
        <Heading as="h2" id="skills-heading" eyebrow="Skills">
          Tools I reach for
        </Heading>

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-8">
          <OrbitGroup label="Technical" groups={technicalGroups} />
          <OrbitGroup label="Productivity" groups={productivityGroups} delay={0.1} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.6, ease: easing.outExpo }}
          className="flex flex-col gap-3"
        >
          <h3 className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
            Coursework &amp; more
          </h3>
          <SkillMarquee items={skillHighlights.flatMap((g) => g.items)} />
        </motion.div>
      </Container>
    </section>
  );
}
