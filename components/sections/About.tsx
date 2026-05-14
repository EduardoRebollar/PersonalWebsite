'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { site } from '@/content/data/site';
import { easing } from '@/lib/motion';

const aboutParagraphs = [
  `I'm Eduardo, a Computer Science & Economics student at Occidental College working across machine learning, data, and the web.`,
  `PLACEHOLDER: second paragraph — origin story, what drew you in, present-day focus. Replace this paragraph when the About narrative is finalized.`,
];

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative bg-base/40 py-24 backdrop-blur-md md:py-32"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.8, ease: easing.outExpo }}
          className="grid gap-10 md:grid-cols-[1fr_auto] md:gap-16"
        >
          <div className="flex flex-col gap-6">
            <Heading as="h2" id="about-heading" eyebrow="About">
              The person behind the work
            </Heading>
            <div className="flex max-w-prose flex-col gap-4 text-fg-mute md:text-lg">
              {aboutParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {site.resumeHref && (
              <a
                href={site.resumeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-hairline bg-surface/50 px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-fg uppercase backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent"
              >
                Download résumé
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>

          <div className="relative aspect-[3/4] w-full max-w-[18rem] overflow-hidden rounded-2xl border border-hairline bg-surface/40 md:w-72">
            <Image
              src="/photo.jpg"
              alt={`${site.name} portrait`}
              fill
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover"
              priority={false}
            />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
