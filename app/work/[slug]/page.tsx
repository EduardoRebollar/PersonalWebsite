import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Pill } from '@/components/ui/Pill';
import { projects } from '@/content/data/projects';
import { listMDXSlugs, projectMDX } from '@/lib/mdx';
import { site } from '@/content/data/site';
import type { Project } from '@/types/content';

type RouteParams = { slug: string };

const exampleProject: Project = {
  slug: '_example',
  title: 'Case study example',
  tagline: 'A throwaway demo proving the /work/[slug] route is wired end-to-end.',
  year: 2026,
  tier: 'hero',
  tech: ['MDX', 'Next.js', 'TypeScript'],
};

function findProject(slug: string): Project | undefined {
  if (slug === '_example') return exampleProject;
  return projects.find((p) => p.slug === slug);
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  return listMDXSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: {
      title: `${project.title} — ${site.name}`,
      description: project.tagline,
      type: 'article',
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const loader = projectMDX[slug];
  if (!loader) notFound();

  const project = findProject(slug);
  const { default: MDXContent } = await loader();

  return (
    <article className="relative z-10 pt-32 pb-24">
      <Container width="prose" className="flex flex-col gap-4">
        {project && (
          <>
            <Link
              href="/#work"
              className="inline-flex w-fit items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase transition-colors hover:text-accent"
            >
              <span aria-hidden="true">←</span> All work
            </Link>
            <p className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
              {project.year} · case study
            </p>
            <h1 className="font-display text-h1 leading-[var(--text-h1--line-height)] tracking-[var(--text-h1--letter-spacing)] text-fg">
              {project.title}
            </h1>
            <p className="text-lg text-fg-mute md:text-xl">{project.tagline}</p>
            {project.tech.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <li key={t}>
                    <Pill subtle>{t}</Pill>
                  </li>
                ))}
              </ul>
            )}
            <hr className="my-10 border-hairline" />
          </>
        )}

        <div className="mdx-prose">
          <MDXContent />
        </div>

        <hr className="mt-16 border-hairline" />
        <Link
          href="/#work"
          className="mt-4 inline-flex w-fit items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase transition-colors hover:text-accent"
        >
          <span aria-hidden="true">←</span> Back to all work
        </Link>
      </Container>
    </article>
  );
}
