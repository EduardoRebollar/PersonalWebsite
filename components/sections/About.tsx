'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3DCard';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { site } from '@/content/data/site';
import { easing } from '@/lib/motion';

const aboutParagraphs = [
  `I'm Eduardo, a Computer Science & Economics student at Occidental College working across machine learning, data, and the web.`,
  `The first thing I built that felt like mine was a small robotic car wired together in an after-school class, on a Chromebook that couldn't hold more than a few tabs open. The constraints made me patient with my tools and curious about what was happening underneath them — habits I still lean on.`,
  `These days I'm drawn to problems at the seam of messy data and clear questions — training models, pulling structure out of noise, and wrapping it all in something someone can actually use. Economics keeps me honest about why a result matters; the web is how I get it in front of people.`,
];

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative py-24 md:py-32"
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

          <CardContainer>
            <CardBody className="h-auto w-full max-w-[18rem] md:w-72">
              <CardItem
                translateZ={40}
                className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-hairline bg-surface/40"
              >
                <Image
                  src="/photo.jpg"
                  alt={`${site.name} portrait`}
                  fill
                  sizes="(max-width: 768px) 100vw, 288px"
                  className="object-cover"
                  priority={false}
                />
              </CardItem>
            </CardBody>
          </CardContainer>
        </motion.div>
      </Container>
    </section>
  );
}
