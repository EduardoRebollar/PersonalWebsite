'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Pill } from '@/components/ui/Pill';
import { experience } from '@/content/data/experience';
import { easing } from '@/lib/motion';

function formatRange(start: string, end: string | 'present'): string {
  const fmt = (iso: string) => {
    const [year, month] = iso.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };
  return `${fmt(start)} — ${end === 'present' ? 'Present' : fmt(end)}`;
}

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative py-24 md:py-32"
    >
      <Container className="flex flex-col gap-12">
        <Heading as="h2" id="experience-heading" eyebrow="Experience">
          Where I&apos;ve worked
        </Heading>

        <ol className="relative flex flex-col gap-6 border-l border-hairline pl-6 md:gap-8 md:pl-8">
          {experience.map((item, i) => (
            <motion.li
              key={`${item.org}-${item.start}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: easing.outExpo, delay: i * 0.06 }}
              className="relative rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_8px_24px_-12px_var(--color-accent)] md:p-8"
            >
              <span
                aria-hidden="true"
                className="absolute top-7 -left-[1.84rem] h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] md:top-9 md:-left-[2.34rem]"
              />
              <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-display text-h3 leading-tight text-fg">{item.role}</h3>
                  <p className="text-fg-mute">
                    {item.org}
                    {item.location && (
                      <span className="text-fg-mute"> · {item.location}</span>
                    )}
                  </p>
                </div>
                <p className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase shrink-0">
                  {formatRange(item.start, item.end)}
                </p>
              </div>

              <p className="mt-4 text-fg">{item.impact}</p>

              <ul className="mt-4 flex flex-col gap-2 text-fg-mute">
                {item.bullets.map((b, j) => (
                  <li key={j} className="relative pl-5 before:absolute before:top-2.5 before:left-0 before:h-px before:w-3 before:bg-fg-mute/40">
                    {b}
                  </li>
                ))}
              </ul>

              {item.tech && item.tech.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {item.tech.map((t) => (
                    <li key={t}>
                      <Pill subtle>{t}</Pill>
                    </li>
                  ))}
                </ul>
              )}
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
