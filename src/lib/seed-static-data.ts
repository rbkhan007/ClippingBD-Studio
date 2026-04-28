import { db } from '@/lib/db';

interface SeedItem {
  category: string;
  key: string;
  title: string;
  subtitle?: string;
  content?: string;
  icon?: string;
  link?: string;
  sortOrder: number;
}

export async function seedMissingStaticData(): Promise<void> {
  const existingCategories = await db.staticData.groupBy({
    by: ['category'],
    _count: { category: true },
  });
  
  const existingCategorySet = new Set(existingCategories.map(c => c.category));
  
  const additionalData: SeedItem[] = [
    // PRICING Section
    { category: 'PRICING', key: 'title', title: 'Transparent Pricing', subtitle: 'Choose the perfect plan for your needs', sortOrder: 1 },
    { category: 'PRICING', key: 'basic_title', title: 'Basic', sortOrder: 1 },
    { category: 'PRICING', key: 'basic_price', title: '$0.20', subtitle: 'per image', sortOrder: 2 },
    { category: 'PRICING', key: 'pro_title', title: 'Professional', sortOrder: 2 },
    { category: 'PRICING', key: 'pro_price', title: '$0.50', subtitle: 'per image', sortOrder: 2 },
    { category: 'PRICING', key: 'enterprise_title', title: 'Enterprise', sortOrder: 3 },
    { category: 'PRICING', key: 'enterprise_price', title: 'Custom', subtitle: 'Contact us', sortOrder: 2 },
    
    // TEAM Section  
    { category: 'TEAM', key: 'title', title: 'Meet Our Team', subtitle: 'Expert professionals delivering excellence', sortOrder: 1 },
    
    // TESTIMONIALS
    { category: 'TESTIMONIALS', key: 'title', title: 'What Our Clients Say', subtitle: 'Trusted by 10,000+ clients worldwide', sortOrder: 1 },
    
    // PORTFOLIO
    { category: 'PORTFOLIO', key: 'title', title: 'Our Portfolio', subtitle: 'Showcasing excellence in every project', sortOrder: 1 },
    
    // FAQ
    { category: 'FAQ', key: 'title', title: 'Frequently Asked Questions', subtitle: 'Find answers to common questions', sortOrder: 1 },
    
    // FEATURES
    { category: 'FEATURES', key: 'title', title: 'Why Choose Us', subtitle: 'What sets us apart from the competition', sortOrder: 1 },
    { category: 'FEATURES', key: 'fast_turnaround', title: '24h Delivery', subtitle: 'Quick turnaround on all projects', icon: 'Zap', sortOrder: 1 },
    { category: 'FEATURES', key: 'quality', title: '99.9% Accuracy', subtitle: 'Industry-leading quality assurance', icon: 'Shield', sortOrder: 2 },
    { category: 'FEATURES', key: 'support', title: '24/7 Support', subtitle: 'Round-the-clock customer support', icon: 'Headphones', sortOrder: 3 },
    { category: 'FEATURES', key: 'pricing', title: 'Competitive Pricing', subtitle: 'Best value for your budget', icon: 'DollarSign', sortOrder: 4 },
    
    // SOCIAL
    { category: 'SOCIAL', key: 'facebook', title: 'https://facebook.com/clippingbd', sortOrder: 1 },
    { category: 'SOCIAL', key: 'twitter', title: 'https://twitter.com/clippingbd', sortOrder: 2 },
    { category: 'SOCIAL', key: 'instagram', title: 'https://instagram.com/clippingbd', sortOrder: 3 },
    { category: 'SOCIAL', key: 'linkedin', title: 'https://linkedin.com/company/clippingbd', sortOrder: 4 },
    { category: 'SOCIAL', key: 'youtube', title: 'https://youtube.com/@clippingbd', sortOrder: 5 },
    
    // NAVBAR
    { category: 'NAVBAR', key: 'logo_text', title: 'ClippingBD Studio', sortOrder: 1 },
    { category: 'NAVBAR', key: 'nav_home', title: 'Home', link: '/', sortOrder: 1 },
    { category: 'NAVBAR', key: 'nav_services', title: 'Services', link: '/services', sortOrder: 2 },
    { category: 'NAVBAR', key: 'nav_pricing', title: 'Pricing', link: '/pricing', sortOrder: 3 },
    { category: 'NAVBAR', key: 'nav_portfolio', title: 'Portfolio', link: '/portfolio', sortOrder: 4 },
    { category: 'NAVBAR', key: 'nav_contact', title: 'Contact', link: '/contact', sortOrder: 5 },
    
    // LEGAL
    { category: 'LEGAL', key: 'privacy_title', title: 'Privacy Policy', link: '/privacy', sortOrder: 1 },
    { category: 'LEGAL', key: 'terms_title', title: 'Terms of Service', link: '/terms', sortOrder: 2 },
  ];

  for (const item of additionalData) {
    // Check if this specific key already exists
    const existing = await db.staticData.findFirst({
      where: { category: item.category, key: item.key },
    });
    
    if (!existing) {
      await db.staticData.create({
        data: {
          category: item.category,
          key: item.key,
          title: item.title,
          subtitle: item.subtitle || null,
          content: item.content || null,
          icon: item.icon || null,
          link: item.link || null,
          sortOrder: item.sortOrder,
          isActive: true,
        },
      });
    }
  }
  
  console.log('Additional static data seeded');
}