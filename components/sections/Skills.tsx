'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Pill } from '@/components/ui/Pill';
import { OrbitingSkills } from '@/components/ui/orbiting-skills';
import { skills } from '@/content/data/skills';
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
      className="flex flex-col items-center gap-6"
    >
      <h3 className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">{label}</h3>
      <OrbitingSkills groups={groups} maxSize={520} />
    </motion.div>
  );
}

export function Skills() {
  const technicalGroups = skills.filter((g) => TECHNICAL_LABELS.has(g.label));
  const productivityGroups = skills.filter((g) => PRODUCTIVITY_LABELS.has(g.label));
  const pillGroups = skills.filter(
    (g) => !TECHNICAL_LABELS.has(g.label) && !PRODUCTIVITY_LABELS.has(g.label),
  );

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative bg-base/40 py-24 backdrop-blur-md md:py-32"
    >
      <Container className="flex flex-col gap-16">
        <Heading as="h2" id="skills-heading" eyebrow="Skills">
          Tools I reach for
        </Heading>

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-8">
          <OrbitGroup label="Technical" groups={technicalGroups} />
          <OrbitGroup label="Productivity" groups={productivityGroups} delay={0.1} />
        </div>

        <div className="grid gap-10 sm:grid-cols-2">
          {pillGroups.map((group, i) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 0.6, ease: easing.outExpo, delay: i * 0.05 }}
              className="flex flex-col gap-4"
            >
              <h3 className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
                {group.label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <Pill>{item}</Pill>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
