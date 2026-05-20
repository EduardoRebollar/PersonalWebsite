import createMDX from '@next/mdx';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withMDX = createMDX({
  // MDX plugins (remark-gfm, etc.) are added in Step 8 using Turbopack-
  // compatible string-reference form (Next 16 cannot serialize function
  // plugin refs).
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        // Self-hosted Spline scene(s). Long edge cache (Vercel purges on each
        // deploy, so re-exports go live immediately); shorter browser cache so
        // returning visitors pick up a swapped scene within a day.
        source: '/spline/:file*.splinecode',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withMDX(nextConfig));
