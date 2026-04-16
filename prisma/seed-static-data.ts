import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding static data...');

  // Check if data already exists
  const existingCount = await prisma.staticData.count();
  
  if (existingCount > 0) {
    console.log(`Static data already exists (${existingCount} records). Skipping...`);
    return;
  }

  const staticData = [
    // HERO Section
    { category: 'HERO', key: 'title', title: 'Professional Image & Video Editing Services', subtitle: 'Global Leader Since 2020', content: 'ClippingBD Studio delivers premium clipping path, video editing, AI operations, and web development services with 99.9% satisfaction rate across 120+ countries.', sortOrder: 1 },
    { category: 'HERO', key: 'cta_primary', title: 'Get Started Free', link: '/auth?mode=signup', sortOrder: 2 },
    { category: 'HERO', key: 'cta_secondary', title: 'View Portfolio', link: '/portfolio', sortOrder: 3 },
    
    // STATS Section
    { category: 'STATS', key: 'images', title: '50M+', subtitle: 'Images Processed', icon: 'Image', sortOrder: 1 },
    { category: 'STATS', key: 'videos', title: '100K+', subtitle: 'Videos Edited', icon: 'Video', sortOrder: 2 },
    { category: 'STATS', key: 'clients', title: '10K+', subtitle: 'Happy Clients', icon: 'Users', sortOrder: 3 },
    { category: 'STATS', key: 'countries', title: '120+', subtitle: 'Countries', icon: 'Globe', sortOrder: 4 },
    
    // SERVICES
    { category: 'SERVICES', key: 'image', title: 'Image Services', subtitle: 'Professional Photo Editing', content: 'Clipping path, retouching, color correction, and e-commerce optimization', icon: 'Image', link: '/services/image', sortOrder: 1 },
    { category: 'SERVICES', key: 'video', title: 'Video Services', subtitle: 'Cinematic Video Editing', content: 'Reel editing, color grading, motion graphics, and post-production', icon: 'Video', link: '/services/video', sortOrder: 2 },
    { category: 'SERVICES', key: 'ai', title: 'AI Operations', subtitle: 'Intelligent Automation', content: 'Custom LLM solutions, data processing, and AI-powered workflows', icon: 'Bot', link: '/services/ai', sortOrder: 3 },
    { category: 'SERVICES', key: 'web', title: 'Web Development', subtitle: 'Custom Web Solutions', content: 'Website design, e-commerce platforms, CMS integration', icon: 'Globe', link: '/services/web', sortOrder: 4 },
    { category: 'SERVICES', key: 'clipping_path', title: 'Clipping Path Services', subtitle: 'Hand-drawn Vector Paths', content: 'Precise cut-out services for e-commerce and catalog images', icon: 'Scissors', link: '/services/clipping-path', sortOrder: 5 },
    
    // FEATURES
    { category: 'FEATURES', key: 'fast', title: '24h Fast Delivery', subtitle: 'Quick turnaround on all projects', icon: 'Zap', sortOrder: 1 },
    { category: 'FEATURES', key: 'quality', title: '99.9% Accuracy', subtitle: 'Industry-leading quality', icon: 'CheckCircle', sortOrder: 2 },
    { category: 'FEATURES', key: 'support', title: '24/7 Support', subtitle: 'Round-the-clock assistance', icon: 'Headphones', sortOrder: 3 },
    { category: 'FEATURES', key: 'pricing', title: 'Competitive Pricing', subtitle: 'Best value for budget', icon: 'DollarSign', sortOrder: 4 },
    
    // PRICING
    { category: 'PRICING', key: 'title', title: 'Transparent Pricing', subtitle: 'Choose the perfect plan', sortOrder: 1 },
    { category: 'PRICING', key: 'starter', title: 'Starter', subtitle: 'From $0.15/image', sortOrder: 2 },
    { category: 'PRICING', key: 'professional', title: 'Professional', subtitle: 'From $0.35/image', sortOrder: 3 },
    { category: 'PRICING', key: 'enterprise', title: 'Enterprise', subtitle: 'Custom pricing', sortOrder: 4 },
    
    // CTA
    { category: 'CTA', key: 'title', title: 'Ready to Transform Your Images?', content: 'Join 10,000+ satisfied clients worldwide', sortOrder: 1 },
    { category: 'CTA', key: 'button', title: 'Start Free Trial', link: '/auth?mode=signup', sortOrder: 2 },
    
    // FOOTER
    { category: 'FOOTER', key: 'about', title: 'Professional image and video editing services since 2020', sortOrder: 1 },
    { category: 'FOOTER', key: 'email', title: 'info@clippingbd.com', sortOrder: 2 },
    { category: 'FOOTER', key: 'phone', title: '+8801749616724', sortOrder: 3 },
    { category: 'FOOTER', key: 'address', title: 'Dinajpur, Bangladesh', sortOrder: 4 },
    
    // NAVBAR
    { category: 'NAVBAR', key: 'home', title: 'Home', link: '/', sortOrder: 1 },
    { category: 'NAVBAR', key: 'services', title: 'Services', link: '/services', sortOrder: 2 },
    { category: 'NAVBAR', key: 'pricing', title: 'Pricing', link: '/pricing', sortOrder: 3 },
    { category: 'NAVBAR', key: 'portfolio', title: 'Portfolio', link: '/portfolio', sortOrder: 4 },
    { category: 'NAVBAR', key: 'contact', title: 'Contact', link: '/contact', sortOrder: 5 },
    { category: 'NAVBAR', key: 'team', title: 'Team', link: '/team', sortOrder: 6 },
    
    // TEAM
    { category: 'TEAM', key: 'title', title: 'Meet Our Expert Team', subtitle: 'Dedicated professionals delivering excellence', sortOrder: 1 },
    
    // TESTIMONIALS
    { category: 'TESTIMONIALS', key: 'title', title: 'What Our Clients Say', subtitle: 'Trusted by 10,000+ clients worldwide', sortOrder: 1 },
    
    // PORTFOLIO
    { category: 'PORTFOLIO', key: 'title', title: 'Our Portfolio', subtitle: 'Showcasing excellence in every project', sortOrder: 1 },
    
    // FAQ
    { category: 'FAQ', key: 'title', title: 'Frequently Asked Questions', subtitle: 'Find answers to common questions', sortOrder: 1 },
    
    // SOCIAL
    { category: 'SOCIAL', key: 'facebook', title: 'https://facebook.com/clippingbd', sortOrder: 1 },
    { category: 'SOCIAL', key: 'twitter', title: 'https://twitter.com/clippingbd', sortOrder: 2 },
    { category: 'SOCIAL', key: 'instagram', title: 'https://instagram.com/clippingbd', sortOrder: 3 },
    { category: 'SOCIAL', key: 'linkedin', title: 'https://linkedin.com/company/clippingbd', sortOrder: 4 },
    { category: 'SOCIAL', key: 'youtube', title: 'https://youtube.com/@clippingbd', sortOrder: 5 },
    
    // LEGAL
    { category: 'LEGAL', key: 'privacy', title: 'Privacy Policy', link: '/privacy', sortOrder: 1 },
    { category: 'LEGAL', key: 'terms', title: 'Terms of Service', link: '/terms', sortOrder: 2 },
  ];

  for (const item of staticData) {
    await prisma.staticData.create({
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

  console.log('Static data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });