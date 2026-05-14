'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Pill } from '@/components/ui/Pill';
import { education } from '@/content/data/education';
import { easing } from '@/lib/motion';

function formatRange(start: string, end: string | 'present'): string {
  const startYear = start.slice(0, 4);
  const endYear = end === 'present' ? 'Present' : end.slice(0, 4);
  return `${startYear} — ${endYear}`;
}

export function Education() {
  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="relative bg-base/40 py-24 backdrop-blur-md md:py-32"
    >
      <Container className="flex flex-col gap-12">
        <Heading as="h2" id="education-heading" eyebrow="Education">
          Where I&apos;ve studied
        </Heading>

        <ol className="relative flex flex-col gap-8 border-l border-hairline pl-6 md:gap-12 md:pl-8">
          {education.map((item, i) => (
            <motion.li
              key={`${item.institution}-${item.start}`}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: easing.outExpo, delay: i * 0.08 }}
              className="relative"
            >
              <span
                aria-hidden="true"
                className="absolute top-2 -left-[1.84rem] h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] md:-left-[2.34rem]"
              />
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
                  {formatRange(item.start, item.end)}
                </p>
                <h3 className="font-display text-h3 leading-tight text-fg">
                  {item.institution}
                </h3>
                <p className="text-fg-mute">{item.credential}</p>
                {item.focus && item.focus.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {item.focus.map((f) => (
                      <li key={f}>
                        <Pill subtle>{f}</Pill>
                      </li>
                    ))}
                  </ul>
                )}
                {item.honors && item.honors.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-fg-mute">
                    {item.honors.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
                {item.activities && item.activities.length > 0 && (
                  <p className="mt-1 text-sm text-fg-mute">
                    {item.activities.join(' · ')}
                  </p>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
