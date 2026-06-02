'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3DCard';
import { Container } from '@/components/ui/primitives/Container';
import { Lightbox } from '@/components/ui/Lightbox';
import { Meteors } from '@/components/ui/backgrounds/meteors';
import { Heading } from '@/components/ui/primitives/Heading';
import { site } from '@/content/data/site';
import { easing } from '@/lib/motion';
import type { MediaImage } from '@/types/content';

const portrait: MediaImage = {
  src: '/photo.jpg',
  alt: `${site.name} portrait`,
  caption: `${site.name} — ${site.role}.`,
};

const aboutParagraphs = [
  `I'm Eduardo, a Computer Science & Economics student at Occidental College working across machine learning, data, and the web.`,
  `The first thing I built that felt like mine was a small robotic car wired together in an after-school class, on a Chromebook that couldn't hold more than a few tabs open. The constraints made me patient with my tools and curious about what was happening underneath them — habits I still lean on.`,
  `These days I'm drawn to problems at the seam of messy data and clear questions — training models, pulling structure out of noise, and wrapping it all in something someone can actually use. Economics keeps me honest about why a result matters; the web is how I get it in front of people.`,
];

export function About() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative pt-24 pb-12 md:pt-32 md:pb-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[calc(var(--container-shell)*1.5)] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
      >
        <Meteors number={30} />
      </div>

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
                View resume
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>

          <CardContainer>
            <CardBody className="h-auto w-full max-w-[18rem] md:w-72">
              <CardItem
                as="button"
                type="button"
                onClick={() => setExpanded(true)}
                aria-label={`Expand portrait: ${portrait.alt}`}
                translateZ={40}
                className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl border border-hairline bg-surface/40 transition-[border-color] duration-300 hover:border-accent/50 focus-visible:border-accent/60"
              >
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 288px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  priority={false}
                />
                {/* Subtle dim on hover/focus as an affordance (no icon). */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 group-focus-visible:bg-black/10"
                />
              </CardItem>
            </CardBody>
          </CardContainer>
        </motion.div>
      </Container>

      <Lightbox
        image={expanded ? portrait : null}
        onClose={() => setExpanded(false)}
      />
    </section>
  );
}
