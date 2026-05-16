import type { ComponentType } from 'react';

/**
 * MDX loader registry. Each entry is a static dynamic-import: the bundler
 * sees the exact path at compile time and code-splits the case study into
 * its own chunk loaded only when /work/[slug] is visited.
 *
 * Phase 3 grows this map as real case studies land:
 *   'la-history': () => import('@/content/projects/la-history.mdx'),
 *   ...
 */

type MDXModule = {
  default: ComponentType;
};

export const projectMDX: Record<string, () => Promise<MDXModule>> = {
  '_example': () => import('@/content/projects/_example.mdx'),
  'bilstm-vs-ffnn': () => import('@/content/projects/bilstm-vs-ffnn.mdx'),
  'la-history': () => import('@/content/projects/la-history.mdx'),
  'reddit-sentiment': () => import('@/content/projects/reddit-sentiment.mdx'),
  'interactivity-and-interpretability': () =>
    import('@/content/projects/interactivity-and-interpretability.mdx'),
  'econometrics-final': () => import('@/content/projects/econometrics-final.mdx'),
};

export function hasMDX(slug: string): boolean {
  return slug in projectMDX;
}

export function listMDXSlugs(): string[] {
  return Object.keys(projectMDX);
}
