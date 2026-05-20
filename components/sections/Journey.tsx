'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Briefcase, GraduationCap, ImagePlus } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Pill } from '@/components/ui/Pill';
import { Timeline, type TimelineEntry } from '@/components/ui/timeline';
import { ShootingStars } from '@/components/ui/shooting-stars';
import { StarsBackground } from '@/components/ui/stars-background';
import { education } from '@/content/data/education';
import { experience } from '@/content/data/experience';
import { easing } from '@/lib/motion';
import type { EducationItem, ExperienceItem, MediaImage } from '@/types/content';

/**
 * Journey — a single chronological timeline that merges Education + Experience.
 * Eduardo studied while working (College Match LA even appears in both, as a
 * prep program then a SWE internship), so one interleaved spine tells the story
 * better than two separate lists. Each entry carries a 🎓/💼 chip so the two
 * tracks stay scannable. Built on the adapted Aceternity Timeline.
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
  // most recent first; same start → ongoing first, then later end first
  a.start !== b.start
    ? b.start.localeCompare(a.start)
    : endKey(b.end).localeCompare(endKey(a.end)),
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

function EducationBody({ item }: { item: EducationItem }) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <h3 className="font-display text-h3 leading-tight text-fg">{item.institution}</h3>
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
        <p className="mt-1 text-sm text-fg-mute">{item.activities.join(' · ')}</p>
      )}
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
      <ul className="mt-4 flex flex-col gap-2 text-fg-mute">
        {item.bullets.map((b, j) => (
          <li
            key={j}
            className="relative pl-5 before:absolute before:top-2.5 before:left-0 before:h-px before:w-3 before:bg-fg-mute/40"
          >
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
    </>
  );
}

function JourneyMedia({ title, images }: { title: string; images?: MediaImage[] }) {
  if (images && images.length > 0) {
    return (
      <div className="flex flex-col gap-3 md:h-full md:flex-1">
        {images.map((img) => (
          <div
            key={img.src}
            className="relative aspect-[3/4] overflow-hidden rounded-xl border border-hairline md:aspect-auto md:flex-1"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 14rem, 16rem"
              className="object-cover"
            />
          </div>
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

const timelineData: TimelineEntry[] = journeyItems.map((item) => ({
  title: item.start.slice(0, 4),
  content: (
    <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5">
      <div className="w-full max-w-[14rem] shrink-0 md:flex md:w-56 md:max-w-none md:flex-col lg:w-64">
        <JourneyMedia
          title={item.kind === 'education' ? item.institution : item.role}
          images={item.images}
        />
      </div>
      <div className="min-w-0 flex-1">
        <JourneyCard item={item} />
      </div>
    </div>
  ),
}));

export function Journey() {
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
    </section>
  );
}
