import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration - only in development
  turbopack: process.env.NODE_ENV === 'development' ? {
    root: process.cwd(),
  } : undefined,
  
  // Security: Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    disableStaticImages: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.cloudsnippets.com',
      },
    ],
  },
  
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
      // Static assets caching - handled automatically by Next.js 16
      // Removed custom Cache-Control for /_next/static/(.*)
      // Removed custom Cache-Control for /images/(.*)
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
    // Optimize package bundling
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react'],
    // Optimize CSS
    optimizeCss: true,
  },
  
  // Enable strict mode for better error detection
  reactStrictMode: true,
  
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