import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, "src/visual-edits/component-tagger-loader.js");
const isElectron = process.env.ELECTRON === 'true';

const nextConfig: NextConfig = {
  assetPrefix: isElectron ? './' : undefined,
  /*
  ...(isElectron ? {} : {
    turbopack: {
      rules: {
        "*.{jsx,tsx}": {
          loaders: [LOADER],
          as: "*.js",
        },
      },
    },
  }),
  */
  images: {
    unoptimized: isElectron,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/pages/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pages/games.html',
        destination: '/games',
        permanent: true,
      },
      {
        source: '/pages/e-sport.html',
        destination: '/e-sport',
        permanent: true,
      },
      {
        source: '/pages/records.html',
        destination: '/records',
        permanent: true,
      },
      {
        source: '/pages/dev.html',
        destination: '/dev',
        permanent: true,
      },
      {
        source: '/pages/ustawienia.html',
        destination: '/ustawienia',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
