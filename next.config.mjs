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
};

export default withBundleAnalyzer(withMDX(nextConfig));
