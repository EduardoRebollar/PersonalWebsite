'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Pill } from '@/components/ui/Pill';
import { skills } from '@/content/data/skills';
import { easing } from '@/lib/motion';

export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative bg-base/40 py-24 backdrop-blur-md md:py-32"
    >
      <Container className="flex flex-col gap-12">
        <Heading as="h2" id="skills-heading" eyebrow="Skills">
          Tools I reach for
        </Heading>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
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
