import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/dev/',
          '/brief/',
          '/orders/',
          '/messages/',
          '/profile/',
          '/billing/',
          '/support/',
          '/editor/',
          '/qa/',
          '/settings/',
          '/cms/',
          '/users/',
          '/statistics/',
          '/system/',
          '/logs/',
        ],
      },
    ],
    sitemap: 'https://clippingbd.com/sitemap.xml',
  };
}
