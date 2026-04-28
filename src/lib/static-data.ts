import { db } from '@/lib/db';

export type StaticDataCategory = 
  | 'HERO'
  | 'SERVICES'
  | 'STATS'
  | 'TESTIMONIALS'
  | 'TEAM'
  | 'PRICING'
  | 'CTA'
  | 'FOOTER'
  | 'NAVBAR'
  | 'SOCIAL'
  | 'FEATURES'
  | 'PORTFOLIO'
  | 'FAQ'
  | 'LEGAL';

export interface StaticDataItem {
  id: string;
  category: string;
  key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
}

interface StaticDataCache {
  data: Record<string, StaticDataItem[]>;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cache: StaticDataCache | null = null;

export async function getStaticData(category?: string, options?: { 
  useCache?: boolean;
  activeOnly?: boolean;
}): Promise<Record<string, StaticDataItem[]> | StaticDataItem[]> {
  const { useCache = true, activeOnly = true } = options || {};
  
  // Check cache
  if (useCache && cache && Date.now() - cache.timestamp < CACHE_TTL) {
    if (category) {
      return cache.data[category] || [];
    }
    return cache.data;
  }

  // Fetch from database
  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (activeOnly) where.isActive = true;

  const staticData = await db.staticData.findMany({
    where,
    orderBy: [
      { category: 'asc' },
      { sortOrder: 'asc' },
    ],
  });

  // Group by category
  const grouped = staticData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    // Parse metadata if it's a string
    const parsed = {
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : null,
    };
    acc[item.category].push(parsed);
    return acc;
  }, {} as Record<string, StaticDataItem[]>);

  // Update cache
  cache = {
    data: grouped,
    timestamp: Date.now(),
  };

  if (category) {
    return grouped[category] || [];
  }
  
  return grouped;
}

export async function getStaticDataByKey(category: string, key: string): Promise<StaticDataItem | null> {
  const data = await getStaticData(category, { useCache: true });
  const items = Array.isArray(data) ? data : (data[category] || []);
  const item = items.find(i => i.key === key);
  
  if (item) {
    return {
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata as unknown as string) : null,
    };
  }
  
  return null;
}

export function clearStaticDataCache(): void {
  cache = null;
}

export async function seedStaticData(): Promise<void> {
  const existingCount = await db.staticData.count();
  
  if (existingCount > 0) {
    console.log('Static data already seeded');
    return;
  }

  const seedData = [
    // HERO Section
    { category: 'HERO', key: 'title', title: 'Professional Image & Video Editing Services', content: 'Global leader in visual content since 2020. We deliver premium clipping path, video editing, and web development services with 99.9% satisfaction rate.', sortOrder: 1 },
    { category: 'HERO', key: 'subtitle', title: 'ClippingPath & Website Services Studio', content: 'Professional Image & Video Editing Services', sortOrder: 2 },
    { category: 'HERO', key: 'cta_primary', title: 'Get Started', link: '/auth?mode=signup', sortOrder: 3 },
    { category: 'HERO', key: 'cta_secondary', title: 'View Portfolio', link: '/portfolio', sortOrder: 4 },
    
    // STATS Section
    { category: 'STATS', key: 'images_processed', title: '50M+', subtitle: 'Images Processed', icon: 'Image', sortOrder: 1 },
    { category: 'STATS', key: 'videos_edited', title: '100K+', subtitle: 'Videos Edited', icon: 'Video', sortOrder: 2 },
    { category: 'STATS', key: 'happy_clients', title: '10K+', subtitle: 'Happy Clients', icon: 'Users', sortOrder: 3 },
    { category: 'STATS', key: 'countries', title: '120+', subtitle: 'Countries Served', icon: 'Globe', sortOrder: 4 },
    
    // SERVICES
    { category: 'SERVICES', key: 'image_title', title: 'Image Services', subtitle: 'Professional Photo Editing', content: 'Clipping path, retouching, color correction, and e-commerce optimization', imageUrl: '/services/image.jpg', link: '/services/image', sortOrder: 1 },
    { category: 'SERVICES', key: 'video_title', title: 'Video Services', subtitle: 'Cinematic Video Editing', content: 'Reel editing, color grading, motion graphics, and post-production', imageUrl: '/services/video.jpg', link: '/services/video', sortOrder: 2 },
    { category: 'SERVICES', key: 'ai_title', title: 'AI Operations', subtitle: 'Intelligent Automation', content: 'Custom LLM solutions, data processing, and AI-powered workflows', imageUrl: '/services/ai.jpg', link: '/services/ai', sortOrder: 3 },
    { category: 'SERVICES', key: 'web_title', title: 'Web Development', subtitle: 'Custom Web Solutions', content: 'Website design, e-commerce platforms, CMS integration, and web applications', imageUrl: '/services/web.jpg', link: '/services/web', sortOrder: 4 },
    { category: 'SERVICES', key: 'clipping_path_title', title: 'Clipping Path', subtitle: 'Hand-drawn Vector Paths', content: 'Precise cut-out services for e-commerce and catalog images', imageUrl: '/services/clipping-path.jpg', link: '/services/clipping-path', sortOrder: 5 },
    
    // CTA Section
    { category: 'CTA', key: 'title', title: 'Ready to Transform Your Images?', content: 'Join 10,000+ satisfied clients worldwide. Get started with a free trial today.', sortOrder: 1 },
    { category: 'CTA', key: 'button', title: 'Start Free Trial', link: '/auth?mode=signup', sortOrder: 2 },
    
    // FOOTER
    { category: 'FOOTER', key: 'about', title: 'About Us', content: 'ClippingBD Studio is a global leader in professional image and video editing services, serving clients across 120+ countries since 2020.', sortOrder: 1 },
    { category: 'FOOTER', key: 'contact_email', title: 'info@clippingbd.com', sortOrder: 2 },
    { category: 'FOOTER', key: 'contact_phone', title: '+8801749616724', sortOrder: 3 },
    { category: 'FOOTER', key: 'address', title: 'Chirirbandar, Dinajpur, Bangladesh', sortOrder: 4 },
  ];

  for (const item of seedData) {
    await db.staticData.create({
      data: {
        category: item.category,
        key: item.key,
        title: item.title,
        subtitle: item.subtitle || null,
        content: item.content || null,
        imageUrl: item.imageUrl || null,
        link: item.link || null,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    });
  }

  console.log('Static data seeded successfully');
}