import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClippingPath & Website Services Studio',
    short_name: 'ClippingBD',
    description: 'Professional Image, Video Editing & Web Development Services. Precision Clipping Paths, Cinematic Color Grading, Custom Web Solutions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#10b981',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-US',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon?s=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon?s=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/og-image.png',
        sizes: '1200x630',
        type: 'image/png',
        form_factor: 'wide',
        label: 'ClippingBD Studio Homepage',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: 'Get Quote',
        short_name: 'Quote',
        description: 'Start a new project and get a quote',
        url: '/brief/new',
        icons: [{ src: '/icon', sizes: '32x32' }],
      },
      {
        name: 'Services',
        short_name: 'Services',
        description: 'View our services',
        url: '/services',
        icons: [{ src: '/icon', sizes: '32x32' }],
      },
      {
        name: 'Pricing',
        short_name: 'Pricing',
        description: 'View pricing information',
        url: '/pricing',
        icons: [{ src: '/icon', sizes: '32x32' }],
      },
      {
        name: 'Contact',
        short_name: 'Contact',
        description: 'Contact us',
        url: '/contact',
        icons: [{ src: '/icon', sizes: '32x32' }],
      },
    ],
  };
}
