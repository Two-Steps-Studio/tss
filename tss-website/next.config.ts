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
          // HTTP Strict Transport Security
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Content Type Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.jsdelivr.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://api.supabase.co https://*.supabase.co wss:",
              "frame-src 'self' https://lottiefiles.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), camera=(), microphone=(), magnetometer=(), gyroscope=(), payment=()',
          },
          // Cache Control for HTML
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      // API routes - allow CORS from trusted origins only
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGIN || "'self'",
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
      // Przekieruj /games do /
      {
        source: '/games',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
