import { site } from '@/content/data/site';
import type { Project } from '@/types/content';

/**
 * Schema.org JSON-LD generators. Consumers pass the result to <JsonLd />.
 *
 * Conventions:
 *   - Person schema lives on `/` only (the canonical author identity).
 *   - Article schema lives on each /work/[slug] page.
 *   - sameAs links unify cross-platform identities (LinkedIn, GitHub).
 */

export function personSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    email: site.email.primary,
    jobTitle: 'Computer Science & Economics Student',
    description: site.description,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Occidental College',
      url: 'https://www.oxy.edu',
    },
    address: site.location
      ? {
          '@type': 'PostalAddress',
          addressLocality: site.location.split(',')[0]?.trim(),
          addressRegion: site.location.split(',')[1]?.trim(),
        }
      : undefined,
    sameAs: site.socials.map((s) => s.href),
    image: `${site.url}/photo.jpg`,
  };
}

export function projectArticleSchema(project: Project): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: project.title,
    description: project.tagline,
    author: {
      '@type': 'Person',
      name: site.name,
      url: site.url,
    },
    datePublished: `${project.year}-01-01`,
    publisher: {
      '@type': 'Person',
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${site.url}/work/${project.slug}`,
    },
    image: `${site.url}/work/${project.slug}/opengraph-image`,
    keywords: project.tech.join(', '),
  };
}
