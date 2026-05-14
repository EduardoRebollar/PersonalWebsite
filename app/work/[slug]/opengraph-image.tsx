import { ImageResponse } from 'next/og';
import { projects } from '@/content/data/projects';
import { listMDXSlugs } from '@/lib/mdx';
import { site } from '@/content/data/site';

export const alt = 'Project case study';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return listMDXSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  const title = project?.title ?? 'Case study';
  const tagline = project?.tagline ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 80,
          background: 'linear-gradient(135deg, #0a1018 0%, #131b26 60%, #1a2433 100%)',
          color: '#e8edf2',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 22,
            color: '#6b7480',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#4fc3d9' }} />
          {site.name}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, color: '#e8edf2', maxWidth: 980 }}>
            {title}
          </div>
          {tagline && (
            <div style={{ fontSize: 28, color: '#8fa8ff', maxWidth: 980, lineHeight: 1.4 }}>
              {tagline}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 20,
            color: '#6b7480',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <div>{project?.year ?? ''}</div>
          <div>eduardorebollar.vercel.app</div>
        </div>
      </div>
    ),
    size,
  );
}
