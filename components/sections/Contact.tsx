'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { RippleLink } from '@/components/ui/RippleLink';
import { site } from '@/content/data/site';
import { easing } from '@/lib/motion';

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative bg-base/40 py-24 backdrop-blur-md md:py-32"
    >
      <Container className="flex flex-col gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8, ease: easing.outExpo }}
          className="flex flex-col gap-6"
        >
          <Heading as="h2" id="contact-heading" eyebrow="Contact">
            Get in touch
          </Heading>
          <p className="max-w-prose text-fg-mute md:text-lg">
            Open to internship and collaboration conversations. Easiest to reach me by email — I&apos;ll usually reply within a day or two.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8, ease: easing.outExpo, delay: 0.1 }}
          className="grid gap-6 sm:grid-cols-2"
        >
          <RippleLink
            href={`mailto:${site.email.primary}`}
            className="group flex flex-col gap-2 rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface/80"
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
              Personal
            </p>
            <p className="font-display text-h3 leading-tight text-fg transition-colors group-hover:text-accent">
              {site.email.primary}
            </p>
          </RippleLink>
          {site.email.secondary && (
            <RippleLink
              href={`mailto:${site.email.secondary}`}
              className="group flex flex-col gap-2 rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface/80"
            >
              <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
                Occidental
              </p>
              <p className="font-display text-h3 leading-tight text-fg transition-colors group-hover:text-accent">
                {site.email.secondary}
              </p>
            </RippleLink>
          )}
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7, ease: easing.outExpo, delay: 0.2 }}
          className="flex flex-wrap gap-x-6 gap-y-3"
        >
          {site.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase transition-colors hover:text-accent"
              >
                {s.label}
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
