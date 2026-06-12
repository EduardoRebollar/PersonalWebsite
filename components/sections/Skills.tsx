'use client';

import { useRef } from 'react';
import { useInView } from 'motion/react';
import { Container } from '@/components/ui/primitives/Container';
import { Heading } from '@/components/ui/primitives/Heading';
import { WaveText } from '@/components/ui/wave-text';
import { OrbitingSkills } from '@/components/ui/orbiting-skills';
import { SkillMarquee } from '@/components/ui/skill-marquee';
import { ShootingStars } from '@/components/ui/backgrounds/shooting-stars';
import { StarsBackground } from '@/components/ui/backgrounds/stars-background';
import { skillHighlights, skills } from '@/content/data/skills';
import { cn } from '@/lib/cn';
import type { SkillGroup } from '@/types/content';

const TECHNICAL_LABELS = new Set(['Languages', 'ML / Data', 'Frameworks', 'Dev Tools']);
const PRODUCTIVITY_LABELS = new Set([
  'Microsoft',
  'Google Workspace',
  'Communication',
  'Network & Creative',
]);

function OrbitGroup({
  label,
  groups,
  reveal,
}: {
  label: string;
  groups: SkillGroup[];
  reveal: boolean;
}) {
  // `.sk-orbit` hosts the per-layer reveal: the label + ignition flare are CSS
  // (globals.css, `.skills-reveal.is-on`), while the constellation itself (core,
  // rings, nodes) fades in ring-by-ring from inside OrbitingSkills, driven by the
  // `reveal` (in-view) signal. The constellation is React-driven rather than CSS
  // because its core/nodes re-render every frame, which stalls CSS keyframes.
  // `relative` anchors the flare ::before to the column.
  return (
    <div className="sk-orbit relative flex flex-col items-center gap-3">
      <h3 className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">{label}</h3>
      <OrbitingSkills groups={groups} maxSize={520} reveal={reveal} />
    </div>
  );
}

export function Skills() {
  const technicalGroups = skills.filter((g) => TECHNICAL_LABELS.has(g.label));
  const productivityGroups = skills.filter((g) => PRODUCTIVITY_LABELS.has(g.label));

  // In-view toggle drives the orbital-ignition entrance. `useInView` is a plain
  // IntersectionObserver wrapper; the motion itself lives in globals.css under
  // .skills-reveal, gated on prefers-reduced-motion. `-20%` bottom margin fires
  // the sequence once the section is genuinely scrolled into view.
  const revealRef = useRef<HTMLDivElement>(null);
  const inView = useInView(revealRef, { once: true, margin: '0px 0px -20% 0px' });

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative isolate overflow-hidden pt-16 pb-12 md:pt-24 md:pb-16"
    >
      {/* Same starfield as the Journey section, extended down through Skills so
          the field reads as one continuous sky. Solid at both edges — it joins
          Journey above and hands off into Projects below, which extends the same
          field down before fading out into Contact. Same centered 1.5x-shell
          band the section's overflow-hidden crops. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[calc(var(--container-shell)*1.5)] overflow-hidden"
      >
        <StarsBackground />
        <ShootingStars minDelay={400} maxDelay={1800} />
        <ShootingStars minDelay={800} maxDelay={2600} starColor="#2dd4bf" trailColor="#818cf8" />
        <ShootingStars minDelay={1200} maxDelay={3200} starColor="#fcd34d" trailColor="#818cf8" />
      </div>

      <Container className="relative z-10">
        {/* `.is-on` (added once the section scrolls into view) drives the orbital
            ignition: the heading slides up, each constellation column scales in
            from its core with a radial glow flare (Technical, then Productivity),
            and the coursework marquee fades up last. Choreography is in globals.css,
            scoped under .skills-reveal and gated on prefers-reduced-motion. */}
        <div ref={revealRef} className={cn('skills-reveal flex flex-col gap-3', inView && 'is-on')}>
          <div className="sk-head">
            <Heading as="h2" id="skills-heading">
              <WaveText text="Skills I utilize" />
            </Heading>
          </div>

          <div className="grid gap-16 lg:grid-cols-2 lg:gap-8">
            <OrbitGroup label="Technical" groups={technicalGroups} reveal={inView} />
            <OrbitGroup label="Productivity" groups={productivityGroups} reveal={inView} />
          </div>

          <div className="sk-marquee flex flex-col gap-3">
            <h3 className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
              Coursework &amp; more
            </h3>
            <SkillMarquee items={skillHighlights.flatMap((g) => g.items)} />
          </div>
        </div>
      </Container>
    </section>
  );
}
