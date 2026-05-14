import type { MetadataRoute } from 'next';
import { site } from '@/content/data/site';
import { listMDXSlugs } from '@/lib/mdx';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const baseUrl = site.url;

  const home: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 1,
  };

  const cases: MetadataRoute.Sitemap = listMDXSlugs().map((slug) => ({
    url: `${baseUrl}/work/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [home, ...cases];
}
