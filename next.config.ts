import type { NextConfig } from "next";

const securityHeaders = [
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
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.plaid.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.upstash.io https://*.plaid.com",
      "frame-src 'self' https://*.plaid.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const noCacheHeaders = [
  {
    key: 'Cache-Control',
    value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
  },
  {
    key: 'Pragma',
    value: 'no-cache',
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
    {
      source: '/overview/:path*',
      headers: noCacheHeaders,
    },
    {
      source: '/transactions/:path*',
      headers: noCacheHeaders,
    },
    {
      source: '/budgets/:path*',
      headers: noCacheHeaders,
    },
    {
      source: '/accounts/:path*',
      headers: noCacheHeaders,
    },
    {
      source: '/settings/:path*',
      headers: noCacheHeaders,
    },
  ],
};

export default nextConfig;
