import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress Turbopack warnings about multiple lockfiles
  turbopack: {
    root: process.cwd(),
  },
  
  // Security: Disable x-powered-by header
  poweredByHeader: false,
  
  // Response headers
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/api/auth/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private',
          },
          {
            key: 'Authorization',
            value: '',
          },
        ],
      },
      {
        source: '/api/proxy/asset/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Output configuration for static generation
  output: 'standalone',
  
  // Experimental features
  experimental: {
    // Enable serverActions for better server/client communication
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/auth/signup',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/auth/reset',
        destination: '/auth',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;