'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Briefcase, GraduationCap, ImagePlus } from 'lucide-react';
import { Container } from '@/components/ui/primitives/Container';
import { Heading } from '@/components/ui/primitives/Heading';
import { Pill } from '@/components/ui/primitives/Pill';
import { Lightbox } from '@/components/ui/Lightbox';
import { Timeline, type TimelineEntry } from '@/components/ui/timeline';
import { ShootingStars } from '@/components/ui/backgrounds/shooting-stars';
import { StarsBackground } from '@/components/ui/backgrounds/stars-background';
import { education } from '@/content/data/education';
import { experience } from '@/content/data/experience';
import { easing } from '@/lib/motion';
import type { EducationItem, ExperienceItem, MediaImage } from '@/types/content';

/**
 * Journey — a single chronological timeline that merges Education + Experience.
 * Eduardo studied while working, so one interleaved spine tells the story better
 * than two separate lists. Each entry carries a 🎓/💼 chip so the two tracks stay
 * scannable. Built on the adapted Aceternity Timeline.
 */

type JourneyItem =
  | ({ kind: 'education' } & EducationItem)
  | ({ kind: 'experience' } & ExperienceItem);

// 'YYYY-MM' strings sort lexically; map ongoing roles past any real date so the
// tiebreak puts them first among entries that share a start month.
const PRESENT_KEY = '9999-99';
const endKey = (end: string): string => (end === 'present' ? PRESENT_KEY : end);

const journeyItems: JourneyItem[] = [
  ...education.map((e): JourneyItem => ({ kind: 'education', ...e })),
  ...experience.map((x): JourneyItem => ({ kind: 'experience', ...x })),
].sort((a, b) =>
  // most recent first; same start → earlier end first, so a completed stint
  // (e.g. the STEAM:CODERS internship) surfaces above a long/ongoing entry
  // that shares its start month (e.g. starting at Occidental).
  a.start !== b.start
    ? b.start.localeCompare(a.start)
    : endKey(a.end).localeCompare(endKey(b.end)),
);

function formatYearRange(start: string, end: string | 'present'): string {
  const endYear = end === 'present' ? 'Present' : end.slice(0, 4);
  return `${start.slice(0, 4)} — ${endYear}`;
}

function formatMonthRange(start: string, end: string | 'present'): string {
  const fmt = (iso: string) => {
    const [year, month] = iso.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };
  return `${fmt(start)} — ${end === 'present' ? 'Present' : fmt(end)}`;
}

// Single source of truth for the timeline's descriptive lists so Education and
// Experience stay visually identical (dash marker, spacing, color). Tag-style
// rows (focus / tech) intentionally render as <Pill> instead — a separate,
// consistent category.
function BulletList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-col gap-2 text-fg-mute${className ? ` ${className}` : ''}`}>
      {items.map((item, i) => (
        <li
          key={i}
          className="relative pl-5 before:absolute before:top-2.5 before:left-0 before:h-px before:w-3 before:bg-fg-mute/40"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function PillRow({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap justify-center gap-2${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <li key={item}>
          <Pill subtle>{item}</Pill>
        </li>
      ))}
    </ul>
  );
}

function EducationBody({ item }: { item: EducationItem }) {
  // Honors + activities render as one list so every bullet shares a single
  // uniform gap (two separate lists would double the spacing between groups).
  const lines = [...(item.honors ?? []), ...(item.activities ?? [])];
  return (
    <div className="mt-4 flex flex-col gap-2">
      <h3 className="font-display text-h3 leading-tight text-fg">{item.institution}</h3>
      <p className="text-fg-mute">{item.credential}</p>
      {lines.length > 0 && <BulletList items={lines} className="mt-2" />}
      {/* Skill pills render last, mirroring the `tech` row on Experience cards. */}
      {item.focus && item.focus.length > 0 && <PillRow items={item.focus} className="mt-5" />}
    </div>
  );
}

function ExperienceBody({ item }: { item: ExperienceItem }) {
  return (
    <>
      <div className="mt-4 flex flex-col gap-0.5">
        <h3 className="font-display text-h3 leading-tight text-fg">{item.role}</h3>
        <p className="text-fg-mute">
          {item.org}
          {item.location && <span className="text-fg-mute"> · {item.location}</span>}
        </p>
      </div>
      <p className="mt-4 text-fg">{item.impact}</p>
      <BulletList items={item.bullets} className="mt-4" />
      {item.tech && item.tech.length > 0 && <PillRow items={item.tech} className="mt-5" />}
    </>
  );
}

function JourneyMedia({
  title,
  images,
  onExpand,
}: {
  title: string;
  images?: MediaImage[];
  onExpand: (img: MediaImage) => void;
}) {
  if (images && images.length > 0) {
    return (
      <div className="flex flex-col gap-3 md:h-full md:flex-1">
        {images.map((img) => (
          <button
            key={img.src}
            type="button"
            onClick={() => onExpand(img)}
            aria-label={`Expand image: ${img.alt}`}
            className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border border-hairline transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-[0_8px_24px_-12px_var(--color-accent)] focus-visible:border-accent/60 md:aspect-auto md:flex-1"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              // Bump above Next's default quality of 75 so the optimizer
              // doesn't add visible recompression softness.
              quality={95}
              // The card only renders ~256px wide, but advertise a much larger
              // size so Next serves a high-res variant (~1080px). This gives the
              // bitmap resolution headroom so it stays sharp when visitors
              // pinch/zoom into the photo on the page.
              sizes="(max-width: 768px) 40rem, 34rem"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {/* Subtle dim on hover/focus as an affordance (no icon). */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 group-focus-visible:bg-black/10"
            />
          </button>
        ))}
      </div>
    );
  }

  // Placeholder until real photos are added via the entry's `images` field.
  return (
    <div
      role="img"
      aria-label={`Placeholder image for ${title}`}
      className="flex aspect-[3/4] items-center justify-center rounded-xl border border-dashed border-hairline bg-gradient-to-br from-surface to-base md:aspect-auto md:h-full md:flex-1"
    >
      <span className="flex flex-col items-center gap-1.5 text-fg-mute/70">
        <ImagePlus className="h-6 w-6" strokeWidth={1.4} aria-hidden="true" />
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Image</span>
      </span>
    </div>
  );
}

function JourneyCard({ item }: { item: JourneyItem }) {
  const isEdu = item.kind === 'education';
  const Icon = isEdu ? GraduationCap : Briefcase;
  const range = isEdu
    ? formatYearRange(item.start, item.end)
    : formatMonthRange(item.start, item.end);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.7, ease: easing.outExpo }}
      className="rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_8px_24px_-12px_var(--color-accent)] md:p-8"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-fg-mute uppercase">
          <Icon className="h-3 w-3" strokeWidth={1.8} aria-hidden="true" />
          {isEdu ? 'Education' : 'Experience'}
        </span>
        <span className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
          {range}
        </span>
      </div>

      {item.kind === 'education' ? (
        <EducationBody item={item} />
      ) : (
        <ExperienceBody item={item} />
      )}
    </motion.div>
  );
}

function buildTimelineData(onExpand: (img: MediaImage) => void): TimelineEntry[] {
  return journeyItems.map((item) => ({
    title: item.start.slice(0, 4),
    content: (
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5">
        <div className="w-full max-w-[14rem] shrink-0 md:flex md:w-56 md:max-w-none md:flex-col lg:w-64">
          <JourneyMedia
            title={item.kind === 'education' ? item.institution : item.role}
            images={item.images}
            onExpand={onExpand}
          />
        </div>
        <div className="min-w-0 flex-1">
          <JourneyCard item={item} />
        </div>
      </div>
    ),
  }));
}

export function Journey() {
  const [active, setActive] = useState<MediaImage | null>(null);
  const timelineData = buildTimelineData(setActive);

  return (
    <section
      id="journey"
      aria-labelledby="journey-heading"
      className="relative py-12 md:py-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[calc(var(--container-shell)*1.5)] overflow-hidden"
        // Fade stars out at both edges (top into About, bottom into Skills) so
        // the field reads as thinning out into the sections above and below.
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)',
        }}
      >
        <StarsBackground />
        {/* Each instance animates one streak at a time; several run in parallel
            (staggered delays) to keep multiple shooting stars on screen. */}
        <ShootingStars minDelay={400} maxDelay={1800} />
        <ShootingStars minDelay={800} maxDelay={2600} starColor="#2dd4bf" trailColor="#818cf8" />
        <ShootingStars minDelay={1200} maxDelay={3200} starColor="#fcd34d" trailColor="#818cf8" />
      </div>
      <Container className="flex flex-col gap-6">
        <Heading as="h2" id="journey-heading" eyebrow="Journey">
          The path so far
        </Heading>
        <Timeline data={timelineData} />
      </Container>

      <Lightbox image={active} onClose={() => setActive(null)} />
    </section>
  );
}
