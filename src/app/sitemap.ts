import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://clippingbd.com';
  const currentDate = new Date();
  
  // Main pages with high priority
  const mainPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/studio`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Service pages - Image Services
  const imageServices = [
    'clipping-path',
    'background-removal',
    'image-masking',
    'photo-retouching',
    'color-correction',
    'shadow-creation',
    'ghost-mannequin',
    'image-resizing',
    'cropping',
    'image-manipulation',
  ].map(slug => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Main service category pages
  const serviceCategories = [
    'image',
    'video',
    'ai',
    'web',
  ].map(slug => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Video services
  const videoServices = [
    'video-editing',
    'color-grading',
    'motion-graphics',
    'video-compression',
    'reel-editing',
  ].map(slug => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // AI services
  const aiServices = [
    'ai-background-removal',
    'ai-upscaling',
    'ai-retouching',
    'batch-processing',
  ].map(slug => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Web services
  const webServices = [
    'website-development',
    'ecommerce-development',
    'landing-pages',
    'api-integration',
  ].map(slug => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Auth pages (lower priority but still indexable)
  const authPages = [
    'auth/login',
    'auth/signup',
    'auth/forgot-password',
  ].map(slug => ({
    url: `${baseUrl}/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }));

  // Legal pages
  const legalPages = [
    'privacy',
    'terms',
  ].map(slug => ({
    url: `${baseUrl}/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }));

  return [
    ...mainPages,
    ...serviceCategories,
    ...imageServices,
    ...videoServices,
    ...aiServices,
    ...webServices,
    ...authPages,
    ...legalPages,
  ];
}
