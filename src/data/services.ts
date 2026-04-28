// Services Data - Easily editable configuration
// Dev account can modify these values through the Admin CMS

export interface ServiceTier {
  id: string;
  name: string;
  description: string;
  pricePerImage: number;
  turnaroundHours: number;
  features: string[];
  isPopular: boolean;
  order: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  stats: string;
  color: string;
  isVisible: boolean;
  order: number;
  tiers: ServiceTier[];
  features: string[];
}

export const servicesData: ServiceItem[] = [
  {
    id: 'service_clipping_path',
    title: 'Clipping Path',
    subtitle: 'Precision Background Removal',
    description: 'Hand-drawn clipping paths for clean, professional cutouts. Perfect for e-commerce and product photography.',
    icon: 'Layers',
    href: '/services/clipping-path',
    gradient: 'from-emerald-500 to-green-600',
    stats: '50M+ Images',
    color: 'emerald',
    isVisible: true,
    order: 1,
    features: [
      'Basic Clipping Path',
      'Compound Path',
      'Complex Path',
      'Multi-Path',
      'Clipping Path with Shadow',
      'Color Path/Multiple Clipping Path',
    ],
    tiers: [
      {
        id: 'tier_basic',
        name: 'Basic',
        description: 'Simple shapes, minimal curves',
        pricePerImage: 0.20,
        turnaroundHours: 24,
        features: ['1-5 anchor points', 'Basic shapes', 'JPEG/PNG output'],
        isPopular: false,
        order: 1,
      },
      {
        id: 'tier_medium',
        name: 'Medium',
        description: 'Moderate complexity',
        pricePerImage: 0.50,
        turnaroundHours: 24,
        features: ['6-15 anchor points', 'Moderate curves', 'All formats'],
        isPopular: true,
        order: 2,
      },
      {
        id: 'tier_complex',
        name: 'Complex',
        description: 'Intricate details',
        pricePerImage: 1.50,
        turnaroundHours: 48,
        features: ['16-30 anchor points', 'Complex curves', 'Layered output'],
        isPopular: false,
        order: 3,
      },
      {
        id: 'tier_super_complex',
        name: 'Super Complex',
        description: 'Highly detailed work',
        pricePerImage: 3.00,
        turnaroundHours: 48,
        features: ['Unlimited anchor points', 'Fine details', 'Custom requirements'],
        isPopular: false,
        order: 4,
      },
    ],
  },
  {
    id: 'service_image',
    title: 'Image Services',
    subtitle: 'Professional Photo Editing',
    description: 'Retouching, color correction, and e-commerce optimization for stunning visuals.',
    icon: 'Image',
    href: '/services/image',
    gradient: 'from-emerald-500 to-teal-600',
    stats: '25M+ Images',
    color: 'teal',
    isVisible: true,
    order: 2,
    features: [
      'Background Removal',
      'Image Masking',
      'Photo Retouching',
      'Color Correction',
      'Shadow Creation',
      'Image Manipulation',
      'Ghost Mannequin',
      'E-commerce Optimization',
    ],
    tiers: [
      {
        id: 'tier_basic_retouch',
        name: 'Basic Retouch',
        description: 'Simple enhancements',
        pricePerImage: 0.30,
        turnaroundHours: 24,
        features: ['Color correction', 'Brightness/contrast', 'Basic cleanup'],
        isPopular: false,
        order: 1,
      },
      {
        id: 'tier_pro_retouch',
        name: 'Pro Retouch',
        description: 'Professional editing',
        pricePerImage: 0.75,
        turnaroundHours: 24,
        features: ['Skin retouching', 'Background cleanup', 'Advanced color grading'],
        isPopular: true,
        order: 2,
      },
      {
        id: 'tier_high_end',
        name: 'High-End',
        description: 'Magazine quality',
        pricePerImage: 2.00,
        turnaroundHours: 48,
        features: ['Beauty retouching', 'Compositing', 'Advanced manipulation'],
        isPopular: false,
        order: 3,
      },
    ],
  },
  {
    id: 'service_video',
    title: 'Video Services',
    subtitle: 'Cinematic Video Editing',
    description: 'Reel editing, color grading, motion graphics, and post-production.',
    icon: 'Video',
    href: '/services/video',
    gradient: 'from-teal-500 to-cyan-600',
    stats: '100K+ Videos',
    color: 'cyan',
    isVisible: true,
    order: 3,
    features: [
      'Video Editing',
      'Color Grading',
      'Motion Graphics',
      'Subtitles & Captions',
      'Audio Sync',
      'Transitions & Effects',
      'Social Media Formats',
      'YouTube Optimization',
    ],
    tiers: [
      {
        id: 'tier_basic_video',
        name: 'Basic Edit',
        description: 'Simple cuts and transitions',
        pricePerImage: 5.00,
        turnaroundHours: 48,
        features: ['Basic cuts', 'Simple transitions', 'Audio sync'],
        isPopular: false,
        order: 1,
      },
      {
        id: 'tier_standard_video',
        name: 'Standard',
        description: 'Professional editing',
        pricePerImage: 15.00,
        turnaroundHours: 72,
        features: ['Color correction', 'Motion graphics', 'Sound design'],
        isPopular: true,
        order: 2,
      },
      {
        id: 'tier_premium_video',
        name: 'Premium',
        description: 'Cinematic production',
        pricePerImage: 35.00,
        turnaroundHours: 96,
        features: ['Advanced color grading', 'VFX', 'Custom motion graphics'],
        isPopular: false,
        order: 3,
      },
    ],
  },
  {
    id: 'service_ai',
    title: 'AI Operations',
    subtitle: 'Intelligent Automation',
    description: 'Custom LLM solutions, data processing, and AI-powered workflows.',
    icon: 'Bot',
    href: '/services/ai',
    gradient: 'from-cyan-500 to-blue-600',
    stats: '1M+ Tasks',
    color: 'blue',
    isVisible: true,
    order: 4,
    features: [
      'AI Background Removal',
      'Auto Image Tagging',
      'Smart Cropping',
      'Batch Processing',
      'Custom AI Models',
      'Data Extraction',
      'Automated Workflows',
      'API Integration',
    ],
    tiers: [
      {
        id: 'tier_ai_basic',
        name: 'AI Basic',
        description: 'Automated processing',
        pricePerImage: 0.10,
        turnaroundHours: 6,
        features: ['Auto background removal', 'Batch processing', 'API access'],
        isPopular: true,
        order: 1,
      },
      {
        id: 'tier_ai_pro',
        name: 'AI Pro',
        description: 'Advanced automation',
        pricePerImage: 0.25,
        turnaroundHours: 4,
        features: ['Custom models', 'Priority processing', 'Webhooks'],
        isPopular: false,
        order: 2,
      },
    ],
  },
  {
    id: 'service_web',
    title: 'Web Design Studio',
    subtitle: 'Digital Experiences',
    description: 'Custom websites, web applications, and digital product design.',
    icon: 'Globe',
    href: '/services/web',
    gradient: 'from-blue-500 to-indigo-600',
    stats: '500+ Projects',
    color: 'indigo',
    isVisible: true,
    order: 5,
    features: [
      'Website Design',
      'E-commerce Development',
      'Web Applications',
      'UI/UX Design',
      'Responsive Design',
      'SEO Optimization',
      'Maintenance & Support',
      'Custom Integrations',
    ],
    tiers: [
      {
        id: 'tier_web_landing',
        name: 'Landing Page',
        description: 'Single page website',
        pricePerImage: 299,
        turnaroundHours: 72,
        features: ['Responsive design', 'Contact form', 'SEO basics'],
        isPopular: false,
        order: 1,
      },
      {
        id: 'tier_web_business',
        name: 'Business Site',
        description: 'Multi-page website',
        pricePerImage: 999,
        turnaroundHours: 168,
        features: ['Up to 10 pages', 'CMS integration', 'Analytics setup'],
        isPopular: true,
        order: 2,
      },
      {
        id: 'tier_web_ecommerce',
        name: 'E-commerce',
        description: 'Online store',
        pricePerImage: 2499,
        turnaroundHours: 336,
        features: ['Product catalog', 'Payment integration', 'Admin panel'],
        isPopular: false,
        order: 3,
      },
      {
        id: 'tier_web_custom',
        name: 'Custom',
        description: 'Bespoke solution',
        pricePerImage: 4999,
        turnaroundHours: 504,
        features: ['Custom features', 'API development', 'Priority support'],
        isPopular: false,
        order: 4,
      },
    ],
  },
];

// Get all visible services
export function getAllVisibleServices(): ServiceItem[] {
  return servicesData
    .filter(service => service.isVisible)
    .sort((a, b) => a.order - b.order);
}

// Get service by ID
export function getServiceById(id: string): ServiceItem | undefined {
  return servicesData.find(service => service.id === id);
}

// Get service by slug
export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return servicesData.find(service => 
    service.href === `/services/${slug}` || service.href.endsWith(slug)
  );
}
