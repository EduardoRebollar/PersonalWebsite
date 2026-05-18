'use client';

import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { RippleLink } from '@/components/ui/RippleLink';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';

export function FeaturedProject() {
  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="relative"
    >
      <Container>
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center gap-5">
              <Eyebrow>Spotlight</Eyebrow>
              <h2
                id="featured-heading"
                className="font-display text-h2 leading-[var(--text-h2--line-height)] tracking-[var(--text-h2--letter-spacing)] text-fg"
              >
                A look inside the work
              </h2>
              <p className="max-w-2xl text-fg-mute">
                Interactivity &amp; Interpretability — a dashboard study on whether interactivity
                helps people read data, or just makes it feel easier.
              </p>
              <RippleLink
                href="/work/interactivity-and-interpretability"
                internal
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-fg/15 px-5 py-2 font-mono text-[12px] tracking-[0.14em] text-fg uppercase transition-colors hover:border-accent hover:text-accent"
              >
                Read the case study →
              </RippleLink>
            </div>
          }
        >
          <Image
            src="/projects/interactivity-and-interpretability/static-dashboard.svg"
            alt="Static dashboard from the Interactivity & Interpretability study"
            width={1400}
            height={720}
            className="mx-auto h-full rounded-2xl object-cover object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </Container>
    </section>
  );
}
