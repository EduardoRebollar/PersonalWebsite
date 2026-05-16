'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { heroProjects, supportingProjects } from '@/content/data/projects';
import { hasMDX } from '@/lib/mdx';
import type { Project } from '@/types/content';
import { easing } from '@/lib/motion';

function resolveSupportingLink(project: Project): { href?: string; external?: boolean } {
  if (project.links?.repo) return { href: project.links.repo, external: true };
  if (hasMDX(project.slug)) return { href: `/work/${project.slug}` };
  return {};
}

function supportingAriaLabel(project: Project, external: boolean | undefined): string {
  if (external) return `Open ${project.title} on GitHub (opens in new tab)`;
  return `Read case study: ${project.title}`;
}

function HeroCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.7, ease: easing.outExpo, delay: index * 0.06 }}
    >
      <Card href={`/work/${project.slug}`} ariaLabel={`Read case study: ${project.title}`}>
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
            {project.year}
          </p>
          <span
            aria-hidden="true"
            className="font-mono text-[11px] text-fg-mute transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
          >
            ↗
          </span>
        </div>
        <h3 className="font-display text-h3 leading-tight text-fg">{project.title}</h3>
        <p className="text-fg-mute">{project.tagline}</p>
        <ul className="mt-1 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <li key={t}>
              <Pill subtle>{t}</Pill>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}

function SupportingCard({ project, index }: { project: Project; index: number }) {
  const { href, external } = resolveSupportingLink(project);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6, ease: easing.outExpo, delay: index * 0.05 }}
    >
      <Card
        href={href}
        external={external}
        ariaLabel={href ? supportingAriaLabel(project, external) : undefined}
        className="gap-3 p-5"
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
            {project.year}
          </p>
          {href && (
            <span
              aria-hidden="true"
              className="font-mono text-[10px] text-fg-mute transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
            >
              ↗
            </span>
          )}
        </div>
        <h3 className="font-display text-lg leading-tight text-fg">{project.title}</h3>
        <p className="text-sm text-fg-mute">{project.tagline}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li key={t}>
              <Pill subtle className="text-[9px]">
                {t}
              </Pill>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}

export function Projects() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative bg-base/40 py-24 backdrop-blur-md md:py-32"
    >
      <Container className="flex flex-col gap-12">
        <Heading as="h2" id="work-heading" eyebrow="Work">
          Selected projects
        </Heading>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {heroProjects.map((p, i) => (
            <HeroCard key={p.slug} project={p} index={i} />
          ))}
        </div>

        {supportingProjects.length > 0 && (
          <div className="flex flex-col gap-6 pt-4 md:pt-6">
            <p className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
              More work
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {supportingProjects.map((p, i) => (
                <SupportingCard key={p.slug} project={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
