import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost', 'verify.prwi.re'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/og/**',
      },
      {
        protocol: 'https',
        hostname: 'verify.prwi.re',
        pathname: '/api/og/**',
      },
    ],
  },
};

export default nextConfig;
