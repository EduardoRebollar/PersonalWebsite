import createMDX from '@next/mdx';
import bundleAnalyzer from '@next/bundle-analyzer';
import remarkGfm from 'remark-gfm';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  experimental: {
    mdxRs: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default withBundleAnalyzer(withMDX(nextConfig));
