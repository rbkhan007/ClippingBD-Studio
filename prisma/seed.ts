import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface SeedItem {
  category: string;
  key: string;
  title: string;
  subtitle?: string;
  content?: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  link?: string;
  sortOrder: number;
}

async function seedStaticData(): Promise<void> {
  const staticDataItems: SeedItem[] = [
    // HERO Section
    { category: 'HERO', key: 'badge_icon', title: 'Sparkles', sortOrder: 1 },
    { category: 'HERO', key: 'badge_text', title: "World's #1 Image Editing Partner for E-commerce", sortOrder: 2 },
    { category: 'HERO', key: 'headline_line1', title: 'Transform Your', sortOrder: 3 },
    { category: 'HERO', key: 'headline_highlight', title: 'Visual Content', sortOrder: 4 },
    { category: 'HERO', key: 'headline_line2', title: 'Into Sales Magnets', sortOrder: 5 },
    { category: 'HERO', key: 'description', title: "Industry-leading clipping path, image editing, and video production services trusted by 10,000+ brands worldwide. Lightning-fast delivery, pixel-perfect quality, and prices that scale with your business.", sortOrder: 6 },
    { category: 'HERO', key: 'primary_cta_text', title: 'Start Free Trial', link: '/auth/signup', sortOrder: 7 },
    { category: 'HERO', key: 'secondary_cta_text', title: 'View Our Work', link: '/portfolio', sortOrder: 8 },

    // SERVICES Section
    { category: 'SERVICES', key: 'title', title: 'Our Services', subtitle: 'Comprehensive image editing solutions', sortOrder: 1 },
    { category: 'SERVICES', key: 'clipping_path_title', title: 'Precision Clipping Path', subtitle: 'Pixel-Perfect Background Removal', sortOrder: 2 },
    { category: 'SERVICES', key: 'image_editing_title', title: 'Professional Image Editing', subtitle: 'Make Every Photo Sell', sortOrder: 3 },
    { category: 'SERVICES', key: 'video_services_title', title: 'Cinematic Video Production', subtitle: 'Videos That Stop The Scroll', sortOrder: 4 },
    { category: 'SERVICES', key: 'ai_automation_title', title: 'AI-Powered Automation', subtitle: 'Scale Without Limits', sortOrder: 5 },
    { category: 'SERVICES', key: 'web_design_title', title: 'Web Design Studio', subtitle: 'Digital Experiences That Convert', sortOrder: 6 },

    // FEATURES Section
    { category: 'FEATURES', key: 'title', title: 'Why Choose Us', subtitle: 'What sets us apart from the competition', sortOrder: 1 },
    { category: 'FEATURES', key: 'turnaround_title', title: 'Lightning-Fast Turnaround', subtitle: 'Standard 24-48 hour delivery', icon: 'Clock', sortOrder: 2 },
    { category: 'FEATURES', key: 'quality_title', title: 'Pixel-Perfect Quality', subtitle: 'Triple-layer quality check', icon: 'Award', sortOrder: 3 },
    { category: 'FEATURES', key: 'security_title', title: 'Bank-Level Security', subtitle: 'End-to-end AES-256 encryption', icon: 'Shield', sortOrder: 4 },
    { category: 'FEATURES', key: 'pricing_title', title: 'Volume Discounts That Scale', subtitle: 'Up to 40% off for high-volume', icon: 'DollarSign', sortOrder: 5 },
    { category: 'FEATURES', key: 'support_title', title: '24/7 Dedicated Support', subtitle: 'Real humans, not chatbots', icon: 'Headphones', sortOrder: 6 },
    { category: 'FEATURES', key: 'revisions_title', title: 'Unlimited Revisions', subtitle: 'No extra charge, no questions asked', icon: 'RefreshCw', sortOrder: 7 },

    // STATISTICS Section
    { category: 'STATS', key: 'images_processed', title: '50M+', subtitle: 'Images Processed', sortOrder: 1 },
    { category: 'STATS', key: 'videos_created', title: '100K+', subtitle: 'Videos Created', sortOrder: 2 },
    { category: 'STATS', key: 'happy_clients', title: '10,000+', subtitle: 'Happy Clients', sortOrder: 3 },
    { category: 'STATS', key: 'countries', title: '120+', subtitle: 'Countries Served', sortOrder: 4 },
    { category: 'STATS', key: 'satisfaction_rate', title: '99.8%', subtitle: 'Satisfaction Rate', sortOrder: 5 },
    { category: 'STATS', key: 'avg_turnaround', title: '18h', subtitle: 'Average Turnaround', sortOrder: 6 },

    // PRICING Section
    { category: 'PRICING', key: 'title', title: 'Transparent Pricing', subtitle: 'Choose the perfect plan for your needs', sortOrder: 1 },
    { category: 'PRICING', key: 'basic_title', title: 'Basic', sortOrder: 2 },
    { category: 'PRICING', key: 'basic_price', title: '$0.20', subtitle: 'per image', sortOrder: 3 },
    { category: 'PRICING', key: 'pro_title', title: 'Professional', sortOrder: 4 },
    { category: 'PRICING', key: 'pro_price', title: '$0.50', subtitle: 'per image', sortOrder: 5 },
    { category: 'PRICING', key: 'enterprise_title', title: 'Enterprise', sortOrder: 6 },
    { category: 'PRICING', key: 'enterprise_price', title: 'Custom', subtitle: 'Contact us', sortOrder: 7 },

    // TEAM Section  
    { category: 'TEAM', key: 'title', title: 'Meet Our Team', subtitle: 'Expert professionals delivering excellence', sortOrder: 1 },

    // TESTIMONIALS Section
    { category: 'TESTIMONIALS', key: 'title', title: 'What Our Clients Say', subtitle: 'Trusted by 10,000+ clients worldwide', sortOrder: 1 },

    // PORTFOLIO Section
    { category: 'PORTFOLIO', key: 'title', title: 'Our Portfolio', subtitle: 'Showcasing excellence in every project', sortOrder: 1 },

    // FAQ Section
    { category: 'FAQ', key: 'title', title: 'Frequently Asked Questions', subtitle: 'Find answers to common questions', sortOrder: 1 },

    // SOCIAL Section
    { category: 'SOCIAL', key: 'facebook', title: 'https://facebook.com/clippingbd', sortOrder: 1 },
    { category: 'SOCIAL', key: 'twitter', title: 'https://twitter.com/clippingbd', sortOrder: 2 },
    { category: 'SOCIAL', key: 'instagram', title: 'https://instagram.com/clippingbd', sortOrder: 3 },
    { category: 'SOCIAL', key: 'linkedin', title: 'https://linkedin.com/company/clippingbd', sortOrder: 4 },
    { category: 'SOCIAL', key: 'youtube', title: 'https://youtube.com/@clippingbd', sortOrder: 5 },

    // NAVBAR Section
    { category: 'NAVBAR', key: 'logo_text', title: 'ClippingBD Studio', sortOrder: 1 },
    { category: 'NAVBAR', key: 'nav_home', title: 'Home', link: '/', sortOrder: 2 },
    { category: 'NAVBAR', key: 'nav_services', title: 'Services', link: '/services', sortOrder: 3 },
    { category: 'NAVBAR', key: 'nav_pricing', title: 'Pricing', link: '/pricing', sortOrder: 4 },
    { category: 'NAVBAR', key: 'nav_portfolio', title: 'Portfolio', link: '/portfolio', sortOrder: 5 },
    { category: 'NAVBAR', key: 'nav_contact', title: 'Contact', link: '/contact', sortOrder: 6 },

    // FOOTER Section
    { category: 'FOOTER', key: 'company_description', title: "Industry-leading clipping path, image editing, and video production services trusted by 10,000+ brands worldwide.", sortOrder: 1 },
    { category: 'FOOTER', key: 'contact_email', title: 'info@clippingbd.com', sortOrder: 2 },
    { category: 'FOOTER', key: 'contact_phone', title: '+8801749616724', sortOrder: 3 },
    { category: 'FOOTER', key: 'contact_address', title: 'Dinajpur, Bangladesh', sortOrder: 4 },

    // LEGAL Section
    { category: 'LEGAL', key: 'privacy_title', title: 'Privacy Policy', link: '/privacy', sortOrder: 1 },
    { category: 'LEGAL', key: 'terms_title', title: 'Terms of Service', link: '/terms', sortOrder: 2 },
  ];

  for (const item of staticDataItems) {
    const existing = await prisma.staticData.findFirst({
      where: { category: item.category, key: item.key },
    });
    
    if (!existing) {
      await prisma.staticData.create({
        data: {
          category: item.category,
          key: item.key,
          title: item.title,
          subtitle: item.subtitle || null,
          content: item.content || null,
          description: item.description || null,
          imageUrl: item.imageUrl || null,
          icon: item.icon || null,
          link: item.link || null,
          sortOrder: item.sortOrder,
          isActive: true,
        },
      });
    }
  }
  console.log('✅ Seeded static data');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoomParticipant.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.qAReview.deleteMany();
  await prisma.task.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.website.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.order.deleteMany();
  await prisma.pricingTier.deleteMany();
  await prisma.service.deleteMany();
  await prisma.session.deleteMany();
  await prisma.clientReview.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.fAQItem.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.cMSPage.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.paymentGateway.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@clippingbd.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        status: 'ACTIVE',
        walletBalance: 0,
        currency: 'USD',
        avatar: null,
        approvedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'developer@clippingbd.com',
        password: hashedPassword,
        name: 'Developer User',
        role: 'DEVELOPER',
        status: 'ACTIVE',
        walletBalance: 0,
        currency: 'USD',
        avatar: null,
        approvedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'client@example.com',
        password: hashedPassword,
        name: 'John Client',
        role: 'CLIENT',
        status: 'ACTIVE',
        walletBalance: 500.00,
        currency: 'USD',
        avatar: null,
        approvedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'client2@example.com',
        password: hashedPassword,
        name: 'Sarah Smith',
        role: 'CLIENT',
        status: 'ACTIVE',
        walletBalance: 250.00,
        currency: 'USD',
        avatar: null,
        approvedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'editor1@clippingbd.com',
        password: hashedPassword,
        name: 'Mike Editor',
        role: 'EDITOR',
        status: 'ACTIVE',
        walletBalance: 150.00,
        currency: 'USD',
        avatar: null,
        approvedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'editor2@clippingbd.com',
        password: hashedPassword,
        name: 'Lisa Designer',
        role: 'EDITOR',
        status: 'ACTIVE',
        walletBalance: 200.00,
        currency: 'USD',
        avatar: null,
        approvedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'editor3@clippingbd.com',
        password: hashedPassword,
        name: 'Alex Retoucher',
        role: 'EDITOR',
        status: 'ACTIVE',
        walletBalance: 175.00,
        currency: 'USD',
        avatar: null,
        approvedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'qa@clippingbd.com',
        password: hashedPassword,
        name: 'QA Manager',
        role: 'QA',
        status: 'ACTIVE',
        walletBalance: 100.00,
        currency: 'USD',
        avatar: null,
        approvedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'pending.client@example.com',
        password: hashedPassword,
        name: 'Pending Client',
        role: 'CLIENT',
        status: 'PENDING',
        walletBalance: 0,
        currency: 'USD',
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        email: 'pending.editor@example.com',
        password: hashedPassword,
        name: 'Pending Editor',
        role: 'EDITOR',
        status: 'PENDING',
        walletBalance: 0,
        currency: 'USD',
        avatar: null,
      },
    }),
  ]);

  console.log('✅ Created users');

  const [admin, developer, client1, client2, editor1, editor2, editor3, qa, pendingClient, pendingEditor] = users;

  // Create Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Clipping Path',
        slug: 'clipping-path',
        category: 'CLIPPING_PATH',
        description: 'Professional clipping path services for product photos',
        features: JSON.stringify(['Background removal', 'Multiple paths', 'Color clipping']),
        basePrice: 1.00,
        turnaround: 24,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Image Retouching',
        slug: 'image-retouching',
        category: 'IMAGE',
        description: 'High-end image retouching and enhancement',
        features: JSON.stringify(['Skin retouching', 'Color correction', 'Noise removal']),
        basePrice: 2.50,
        turnaround: 24,
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Video Editing',
        slug: 'video-editing',
        category: 'VIDEO',
        description: 'Professional video editing services',
        features: JSON.stringify(['Color grading', 'Transitions', 'Subtitles']),
        basePrice: 150.00,
        turnaround: 48,
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        name: 'AI Background Removal',
        slug: 'ai-background',
        category: 'AI',
        description: 'AI-powered background removal for bulk images',
        features: JSON.stringify(['Fast processing', 'Bulk upload', 'API access']),
        basePrice: 0.10,
        turnaround: 12,
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Web Development',
        slug: 'web-development',
        category: 'WEB',
        description: 'Custom web development services',
        features: JSON.stringify(['Next.js', 'React', 'Responsive design']),
        basePrice: 500.00,
        turnaround: 168,
        isActive: true,
        sortOrder: 5,
      },
    }),
  ]);

  console.log('✅ Created services');

  // Seed Static Data from data files
  await seedStaticData();

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Admin: admin@clippingbd.com / password123');
  console.log('  Developer: developer@clippingbd.com / password123');
  console.log('  Client: client@example.com / password123');
  console.log('  Editor: editor1@clippingbd.com / password123');
  console.log('  QA: qa@clippingbd.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });