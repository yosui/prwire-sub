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
  async headers() {
    return [
      {
        // OG画像APIのパスに対するヘッダー設定
        source: '/api/og',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        // プレビューページのパスに対するヘッダー設定
        source: '/preview/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
