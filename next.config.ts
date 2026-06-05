import type { NextConfig } from "next";
import mdx from '@next/mdx'
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],

  experimental: {
    mdxRs: true,
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  poweredByHeader: false,

  async redirects() {
    return [
      { source: '/practice', destination: '/skill', permanent: true },
      { source: '/practice/:path*', destination: '/skill', permanent: true },
      { source: '/resource', destination: '/skill', permanent: true },
      { source: '/resource/:path*', destination: '/skill', permanent: true },
    ];
  },
};

export default mdx()(nextConfig)
