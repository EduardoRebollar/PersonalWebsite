import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Pill } from '@/components/ui/Pill';
import { RippleLink } from '@/components/ui/RippleLink';
import {
  Carousel,
  Card,
  type CarouselCard,
} from '@/components/ui/AppleCardsCarousel';
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

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative py-24 md:py-32"
    >
      <Container className="flex flex-col gap-12">
        <Heading as="h2" id="work-heading" eyebrow="Work">
          Selected projects
        </Heading>
      </Container>

      <Carousel items={cards} />
    </section>
  );
}
