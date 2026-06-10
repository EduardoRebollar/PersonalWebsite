import { Container } from '@/components/ui/primitives/Container';
import { Heading } from '@/components/ui/primitives/Heading';
import { Pill } from '@/components/ui/primitives/Pill';
import { WaveText } from '@/components/ui/wave-text';
import { RippleLink } from '@/components/ui/cta/RippleLink';
import {
  Carousel,
  Card,
  type CarouselCard,
} from '@/components/ui/AppleCardsCarousel';
import { ShootingStars } from '@/components/ui/backgrounds/shooting-stars';
import { StarsBackground } from '@/components/ui/backgrounds/stars-background';
import { projects } from '@/content/data/projects';
import { hasMDX } from '@/lib/mdx';
import type { Project } from '@/types/content';

const CTA_PRIMARY =
  'inline-flex items-center gap-2 rounded-full border border-accent/60 bg-surface/60 px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-fg uppercase transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent';

const CTA_SECONDARY =
  'inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/40 px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-fg';

function ProjectModalContent({ project }: { project: Project }) {
  const isInternalDemo = project.links?.demo?.startsWith('/') ?? false;
  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg leading-relaxed text-fg-mute md:text-xl">{project.tagline}</p>

      <ul className="flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <li key={t}>
            <Pill subtle>{t}</Pill>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3 pt-2">
        {hasMDX(project.slug) && (
          <RippleLink href={`/work/${project.slug}`} internal className={CTA_PRIMARY}>
            Read case study
            <span aria-hidden="true">→</span>
          </RippleLink>
        )}
        {project.links?.repo && (
          <RippleLink href={project.links.repo} className={CTA_SECONDARY}>
            View on GitHub
            <span aria-hidden="true">↗</span>
          </RippleLink>
        )}
        {project.links?.demo && (
          <RippleLink
            href={project.links.demo}
            internal={isInternalDemo}
            className={CTA_SECONDARY}
          >
            Open demo
            <span aria-hidden="true">{isInternalDemo ? '→' : '↗'}</span>
          </RippleLink>
        )}
      </div>
    </div>
  );
}

function toCard(project: Project): CarouselCard {
  const category = `${project.year} · ${project.tier === 'hero' ? 'Case study' : 'Project'}`;
  return {
    src: `/projects/${project.slug}/cover.png`,
    title: project.title,
    category,
    tech: project.tech,
    content: <ProjectModalContent project={project} />,
  };
}

export function Projects() {
  const cards = projects.map((project, index) => (
    <Card key={project.slug} card={toCard(project)} index={index} />
  ));
  const labels = projects.map((project) => project.title);

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-16"
    >
      {/* Same starfield as Skills, extended down so the sky reads continuously
          from Journey → Skills → Work. Solid at both edges — it hands off from
          Skills above and into Contact below, which extends the same field down
          before fading out into the footer. Same centered 1.5x-shell band the
          section's overflow-hidden crops. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[calc(var(--container-shell)*1.5)] overflow-hidden"
      >
        <StarsBackground />
        <ShootingStars minDelay={400} maxDelay={1800} />
        <ShootingStars minDelay={800} maxDelay={2600} starColor="#2dd4bf" trailColor="#818cf8" />
        <ShootingStars minDelay={1200} maxDelay={3200} starColor="#fcd34d" trailColor="#818cf8" />
      </div>

      <Container className="flex flex-col gap-12">
        <Heading as="h2" id="work-heading" gapClassName="gap-2">
          <WaveText text="Selected projects" />
        </Heading>
      </Container>

      <div className="mx-auto w-full max-w-[var(--container-shell)]">
        <Carousel items={cards} labels={labels} />
      </div>
    </section>
  );
}
