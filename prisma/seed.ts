<<<<<<< HEAD
[{}]
=======
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
    // Admin users - pre-approved
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
    // Client users - pre-approved
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
    // Editor users - pre-approved
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
    // QA user - pre-approved
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
    // Pending users - awaiting approval
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

  // Create Orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-001',
        clientId: client1.id,
        serviceId: services[0].id,
        status: 'IN_PROGRESS',
        priority: 'STANDARD',
        title: 'Product Photos Batch #45',
        description: 'E-commerce product photography clipping paths',
        quantity: 150,
        serviceType: 'IMAGE',
        baseAmount: 150.00,
        priorityBonus: 0,
        totalAmount: 150.00,
        isPaid: true,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-002',
        clientId: client1.id,
        serviceId: services[1].id,
        status: 'QA',
        priority: 'EXPRESS',
        title: 'Fashion Collection Retouching',
        description: 'Fashion collection retouching for spring catalog',
        quantity: 45,
        serviceType: 'IMAGE',
        baseAmount: 112.50,
        priorityBonus: 16.88,
        totalAmount: 129.38,
        isPaid: true,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-003',
        clientId: client1.id,
        serviceId: services[0].id,
        status: 'COMPLETED',
        priority: 'NITRO',
        title: 'Fashion Campaign Retouching',
        description: 'High-end fashion campaign - rush delivery',
        quantity: 28,
        serviceType: 'IMAGE',
        baseAmount: 70.00,
        priorityBonus: 17.50,
        totalAmount: 87.50,
        isPaid: true,
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-004',
        clientId: client2.id,
        serviceId: services[2].id,
        status: 'PENDING',
        priority: 'STANDARD',
        title: 'Product Promo Video',
        description: 'Product promotional video editing',
        quantity: 3,
        serviceType: 'VIDEO',
        baseAmount: 450.00,
        priorityBonus: 0,
        totalAmount: 450.00,
        isPaid: false,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-005',
        clientId: client2.id,
        serviceId: services[3].id,
        status: 'DRAFT',
        priority: 'STANDARD',
        title: 'AI Background Removal Batch',
        description: 'Automated background removal for 500 images',
        quantity: 500,
        serviceType: 'AI',
        baseAmount: 50.00,
        priorityBonus: 0,
        totalAmount: 50.00,
        isPaid: false,
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-006',
        clientId: client1.id,
        serviceId: services[4].id,
        status: 'IN_PROGRESS',
        priority: 'STANDARD',
        title: 'E-commerce Website',
        description: 'Custom e-commerce website development',
        quantity: 1,
        serviceType: 'WEB',
        baseAmount: 2500.00,
        priorityBonus: 0,
        totalAmount: 2500.00,
        isPaid: true,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('✅ Created orders');

  // Create Tasks
  const tasks = await Promise.all([
    // Available tasks
    prisma.task.create({
      data: {
        orderId: orders[0].id,
        status: 'AVAILABLE',
        department: 'CLIPPING_PATH',
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
        payoutAmount: 12.50,
      },
    }),
    prisma.task.create({
      data: {
        orderId: orders[0].id,
        status: 'AVAILABLE',
        department: 'CLIPPING_PATH',
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
        payoutAmount: 15.00,
      },
    }),
    prisma.task.create({
      data: {
        orderId: orders[1].id,
        status: 'AVAILABLE',
        department: 'RETOUCHING',
        deadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
        payoutAmount: 22.00,
      },
    }),
    prisma.task.create({
      data: {
        orderId: orders[3].id,
        status: 'AVAILABLE',
        department: 'MOTION_GRAPHICS',
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        payoutAmount: 45.00,
      },
    }),
    // Claimed tasks by editor1
    prisma.task.create({
      data: {
        orderId: orders[0].id,
        editorId: editor1.id,
        status: 'IN_PROGRESS',
        department: 'CLIPPING_PATH',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
        payoutAmount: 15.00,
        claimedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        orderId: orders[1].id,
        editorId: editor1.id,
        status: 'IN_PROGRESS',
        department: 'RETOUCHING',
        deadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
        payoutAmount: 20.00,
        claimedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    }),
    // Task submitted for QA
    prisma.task.create({
      data: {
        orderId: orders[2].id,
        editorId: editor2.id,
        status: 'SUBMITTED',
        department: 'CLIPPING_PATH',
        deadline: new Date(Date.now() - 1 * 60 * 60 * 1000),
        payoutAmount: 18.00,
        claimedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
    // Web development task
    prisma.task.create({
      data: {
        orderId: orders[5].id,
        editorId: editor3.id,
        status: 'IN_PROGRESS',
        department: 'WEB_DEVELOPMENT',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        payoutAmount: 250.00,
        claimedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('✅ Created tasks');

  // Create Transactions
  await Promise.all([
    prisma.transaction.create({
      data: {
        userId: client1.id,
        type: 'DEPOSIT',
        amount: 500,
        currency: 'USD',
        status: 'SUCCESS',
        paymentMethod: 'card',
        description: 'Wallet deposit via Stripe',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: client1.id,
        type: 'ORDER_PAYMENT',
        amount: -150,
        currency: 'USD',
        status: 'SUCCESS',
        description: 'Payment for ORD-2024-001',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: client1.id,
        type: 'ORDER_PAYMENT',
        amount: -129.38,
        currency: 'USD',
        status: 'SUCCESS',
        description: 'Payment for ORD-2024-002',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: client1.id,
        type: 'ORDER_PAYMENT',
        amount: -87.50,
        currency: 'USD',
        status: 'SUCCESS',
        description: 'Payment for ORD-2024-003',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: client2.id,
        type: 'DEPOSIT',
        amount: 250,
        currency: 'USD',
        status: 'SUCCESS',
        paymentMethod: 'card',
        description: 'Wallet deposit',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: client2.id,
        type: 'ORDER_PAYMENT',
        amount: -2500,
        currency: 'USD',
        status: 'SUCCESS',
        description: 'Payment for ORD-2024-006',
      },
    }),
  ]);

  console.log('✅ Created transactions');

  // Create Payouts
  await Promise.all([
    prisma.payout.create({
      data: {
        editorId: editor1.id,
        amount: 125.50,
        status: 'COMPLETED',
        periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
        processedAt: new Date(),
      },
    }),
    prisma.payout.create({
      data: {
        editorId: editor2.id,
        amount: 98.00,
        status: 'PENDING',
        periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
      },
    }),
  ]);

  console.log('✅ Created payouts');

  // Create Support Tickets
  await Promise.all([
    prisma.supportTicket.create({
      data: {
        clientId: client1.id,
        orderId: orders[0].id,
        subject: 'Question about delivery time',
        description: 'I need to know when my order will be delivered.',
        status: 'OPEN',
        priority: 'NORMAL',
      },
    }),
    prisma.supportTicket.create({
      data: {
        clientId: client2.id,
        subject: 'Billing inquiry',
        description: 'Need clarification on my recent invoice.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      },
    }),
  ]);

  console.log('✅ Created support tickets');

  // Create Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        name: 'David Johnson',
        role: 'E-commerce Manager',
        company: 'TechStore Inc.',
        content: 'ClippingBD has transformed our product photography workflow. The quality and turnaround time are exceptional.',
        rating: 5,
        isPublished: true,
        sortOrder: 1,
      },
      {
        name: 'Emily Chen',
        role: 'Creative Director',
        company: 'Fashion Forward',
        content: 'Incredible attention to detail. Our fashion campaigns have never looked better.',
        rating: 5,
        isPublished: true,
        sortOrder: 2,
      },
      {
        name: 'Michael Brown',
        role: 'Marketing Lead',
        company: 'Brand Co.',
        content: 'Fast, reliable, and professional. Highly recommend for any image editing needs.',
        rating: 4,
        isPublished: true,
        sortOrder: 3,
      },
    ],
  });

  console.log('✅ Created testimonials');

  // Create Client Reviews (pending approval)
  await prisma.clientReview.createMany({
    data: [
      {
        name: 'Jennifer Lee',
        email: 'jennifer@example.com',
        company: 'JL Photography',
        role: 'Photographer',
        content: 'Amazing service! The clipping paths are precise and delivered on time.',
        rating: 5,
        status: 'APPROVED',
      },
      {
        name: 'Robert Wilson',
        email: 'robert@example.com',
        company: 'Wilson Studios',
        content: 'Great quality work at competitive prices. Will definitely use again.',
        rating: 4,
        status: 'PENDING',
      },
    ],
  });

  console.log('✅ Created client reviews');

  // Create Team Members
  await prisma.teamMember.createMany({
    data: [
      {
        name: 'Belal Sarker',
        role: 'Owner & Founder',
        bio: 'Founder of ClippingBD Studio with 10+ years of experience in image editing.',
        isPublished: true,
        sortOrder: 1,
      },
      {
        name: 'Rakibul Hasan',
        role: 'Lead Developer',
        bio: 'Full-stack developer specializing in Next.js and modern web technologies.',
        isPublished: true,
        sortOrder: 2,
      },
    ],
  });

  console.log('✅ Created team members');

  // Create Portfolio Items
  await prisma.portfolioItem.createMany({
    data: [
      {
        title: 'E-commerce Product Photography',
        description: 'Professional product clipping paths for online stores',
        category: 'CLIPPING_PATH',
        serviceType: 'IMAGE',
        beforeImage: '/portfolio/before-1.jpg',
        afterImage: '/portfolio/after-1.jpg',
        isPublished: true,
        sortOrder: 1,
      },
      {
        title: 'Fashion Retouching',
        description: 'High-end fashion photo retouching',
        category: 'RETOUCHING',
        serviceType: 'IMAGE',
        beforeImage: '/portfolio/before-2.jpg',
        afterImage: '/portfolio/after-2.jpg',
        isPublished: true,
        sortOrder: 2,
      },
    ],
  });

  console.log('✅ Created portfolio items');

  // Create FAQ Items
  await prisma.fAQItem.createMany({
    data: [
      {
        question: 'What is a clipping path?',
        answer: 'A clipping path is a vector path used to outline objects in an image, allowing them to be separated from their background.',
        category: 'SERVICES',
        sortOrder: 1,
        isPublished: true,
      },
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery is 24-48 hours. Express (12-24h) and Nitro (12h) options are available for urgent projects.',
        category: 'PRICING',
        sortOrder: 2,
        isPublished: true,
      },
      {
        question: 'What file formats do you accept?',
        answer: 'We accept all major image formats including JPEG, PNG, TIFF, PSD, and RAW files from various camera brands.',
        category: 'TECHNICAL',
        sortOrder: 3,
        isPublished: true,
      },
    ],
  });

  console.log('✅ Created FAQ items');

  // Create System Settings
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'site_name',
        value: 'ClippingBD Studio',
        type: 'TEXT',
        description: 'Website name',
      },
      {
        key: 'site_description',
        value: 'Professional clipping path and image editing services',
        type: 'TEXT',
        description: 'Website meta description',
      },
      {
        key: 'contact_email',
        value: 'info@clippingbd.com',
        type: 'TEXT',
        description: 'Primary contact email',
      },
      {
        key: 'whatsapp_number',
        value: '+8801749616724',
        type: 'TEXT',
        description: 'WhatsApp contact number',
      },
    ],
  });

  console.log('✅ Created system settings');

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: client1.id,
        type: 'ORDER_UPDATE',
        title: 'Order In Progress',
        message: 'Your order ORD-2024-001 is now being processed.',
        link: '/orders',
      },
      {
        userId: editor1.id,
        type: 'NITRO_ALERT',
        title: 'New Nitro Task Available',
        message: 'A high-priority Nitro task is available for claiming.',
        link: '/editor/jobs',
      },
      {
        userId: qa.id,
        type: 'QA_FEEDBACK',
        title: 'Task Submitted for Review',
        message: 'A task has been submitted for QA review.',
        link: '/qa',
      },
    ],
  });

  console.log('✅ Created notifications');

  // Create Payment Gateways (placeholder - admin needs to configure with real credentials)
  // NOTE: Replace with your real credentials from:
  // - PayPal Sandbox: https://developer.paypal.com/developer/applications/
  // - Stripe Test: https://dashboard.stripe.com/test/apikeys
  // - bKash/Nagad: Contact provider for merchant credentials
  await prisma.paymentGateway.createMany({
    data: [
      {
        provider: 'paypal',
        displayName: 'PayPal',
        isEnabled: false,
        publicKey: null, // PayPal Client ID from developer.paypal.com
        secretKey: null, // PayPal Client Secret (will be encrypted)
        currency: 'USD',
        description: 'PayPal payment gateway. Get sandbox credentials from: https://developer.paypal.com/developer/applications/',
        sortOrder: 1,
      },
      {
        provider: 'stripe',
        displayName: 'Stripe',
        isEnabled: false,
        publicKey: null, // Stripe Publishable Key (pk_test_...)
        secretKey: null, // Stripe Secret Key (sk_test_...) (will be encrypted)
        webhookSecret: null, // Stripe Webhook Secret (whsec_...)
        currency: 'USD',
        description: 'Stripe payment gateway. Get test credentials from: https://dashboard.stripe.com/test/apikeys',
        sortOrder: 2,
      },
      {
        provider: 'bkash',
        displayName: 'bKash',
        isEnabled: false,
        merchantId: null, // bKash Merchant ID
        publicKey: null, // bKash Public Key
        secretKey: null, // bKash Secret Key (will be encrypted)
        currency: 'BDT',
        description: 'bKash mobile payment (Bangladesh). Contact bKash for merchant credentials.',
        sortOrder: 3,
      },
      {
        provider: 'nagad',
        displayName: 'Nagad',
        isEnabled: false,
        merchantId: null, // Nagad Merchant ID
        publicKey: null, // Nagad Public Key
        secretKey: null, // Nagad Secret Key (will be encrypted)
        currency: 'BDT',
        description: 'Nagad mobile payment (Bangladesh). Contact Nagad for merchant credentials.',
        sortOrder: 4,
      },
      {
        provider: 'payoneer',
        displayName: 'Payoneer',
        isEnabled: false,
        merchantId: null, // Payoneer Merchant ID
        secretKey: null, // Payoneer API Key (will be encrypted)
        currency: 'USD',
        description: 'Payoneer payout service for editors. Get credentials from: https://payoneer.com',
        sortOrder: 5,
      },
    ],
  });

  console.log('✅ Created payment gateways (pending admin configuration)');

  // Create Exchange Rates
  await prisma.exchangeRate.createMany({
    data: [
      { fromCurrency: 'USD', toCurrency: 'USD', rate: 1.0, source: 'base' },
      { fromCurrency: 'USD', toCurrency: 'BDT', rate: 110.0, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.92, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.79, source: 'manual' },
      { fromCurrency: 'BDT', toCurrency: 'USD', rate: 0.0091, source: 'manual' },
      { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.09, source: 'manual' },
      { fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.27, source: 'manual' },
    ],
  });

  console.log('✅ Created exchange rates');

  // Seed Static Data from data files
  await seedStaticData();

  // Seed additional data from data files (Services, Pricing, Team, Features, FAQs, etc.)
  
  // ============== SEED SERVICES ==============
  const servicesData = [
    {
      name: 'Clipping Path',
      slug: 'clipping-path',
      category: 'CLIPPING_PATH',
      description: 'Hand-drawn clipping paths for clean, professional cutouts. Perfect for e-commerce and product photography.',
      features: JSON.stringify(['Basic Clipping Path', 'Compound Path', 'Complex Path', 'Multi-Path', 'Clipping Path with Shadow', 'Color Path/Multiple Clipping Path']),
      basePrice: 0.20,
      turnaround: 24,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Image Services',
      slug: 'image-services',
      category: 'IMAGE',
      description: 'Retouching, color correction, and e-commerce optimization for stunning visuals.',
      features: JSON.stringify(['Background Removal', 'Image Masking', 'Photo Retouching', 'Color Correction', 'Shadow Creation', 'Image Manipulation', 'Ghost Mannequin', 'E-commerce Optimization']),
      basePrice: 0.30,
      turnaround: 24,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Video Services',
      slug: 'video-services',
      category: 'VIDEO',
      description: 'Reel editing, color grading, motion graphics, and post-production.',
      features: JSON.stringify(['Video Editing', 'Color Grading', 'Motion Graphics', 'Subtitles & Captions', 'Audio Sync', 'Transitions & Effects', 'Social Media Formats', 'YouTube Optimization']),
      basePrice: 15.00,
      turnaround: 48,
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'AI Operations',
      slug: 'ai-operations',
      category: 'AI',
      description: 'Custom LLM solutions, data processing, and AI-powered workflows.',
      features: JSON.stringify(['AI Background Removal', 'Auto Image Tagging', 'Smart Cropping', 'Batch Processing', 'Custom AI Models', 'Data Extraction', 'Automated Workflows', 'API Integration']),
      basePrice: 0.10,
      turnaround: 6,
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'Web Design Studio',
      slug: 'web-design-studio',
      category: 'WEB',
      description: 'Custom websites, web applications, and digital product design.',
      features: JSON.stringify(['Website Design', 'E-commerce Development', 'Web Applications', 'UI/UX Design', 'Responsive Design', 'SEO Optimization', 'Maintenance & Support', 'Custom Integrations']),
      basePrice: 299.00,
      turnaround: 72,
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const service of servicesData) {
    const existing = await prisma.service.findFirst({ where: { slug: service.slug } });
    if (!existing) {
      await prisma.service.create({ data: service });
    }
  }
  console.log('✅ Seeded services');

  // ============== SEED SERVICE CATEGORIES ==============
  const categories = [
    { name: 'Image Editing', slug: 'image-editing', description: 'Professional image editing services', icon: 'Image', sortOrder: 1 },
    { name: 'Video Services', slug: 'video-services', description: 'Video editing and production', icon: 'Video', sortOrder: 2 },
    { name: 'E-commerce', slug: 'ecommerce', description: 'E-commerce optimization', icon: 'ShoppingCart', sortOrder: 3 },
    { name: 'AI Services', slug: 'ai-services', description: 'AI-powered automation', icon: 'Bot', sortOrder: 4 },
    { name: 'Web Design', slug: 'web-design', description: 'Web development and design', icon: 'Globe', sortOrder: 5 },
    { name: 'Specialized', slug: 'specialized', description: 'Specialized editing services', icon: 'Star', sortOrder: 6 },
  ];

  for (const cat of categories) {
    const existing = await prisma.serviceCategory.findFirst({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.serviceCategory.create({ data: { ...cat, isActive: true } });
    }
  }
  console.log('✅ Seeded service categories');

  // ============== SEED TEAM MEMBERS ==============
  const teamMembers = [
    {
      name: 'Belal Sarker',
      role: 'Admin & Owner',
      bio: 'Leading the strategic vision and administrative operations of ClippingPath & Website Services Studio, ensuring business growth and client excellence across 120+ countries.',
      socialLinks: JSON.stringify({ linkedin: '#', twitter: '#' }),
      isPublished: true,
      sortOrder: 1,
    },
    {
      name: 'Rakibul Hasan',
      role: 'Developer & Designer',
      bio: 'The architect behind ClippingPath & Website Services Studio\'s digital infrastructure. Specializing in high-performance Web Development (Next.js, Prisma) and modern UI/UX design.',
      socialLinks: JSON.stringify({ linkedin: '#', github: '#' }),
      isPublished: true,
      sortOrder: 2,
    },
  ];

  for (const member of teamMembers) {
    const existing = await prisma.teamMember.findFirst({ where: { name: member.name } });
    if (!existing) {
      await prisma.teamMember.create({ data: member });
    }
  }
  console.log('✅ Seeded team members');

  // ============== SEED TESTIMONIALS ==============
  const testimonials = [
    { name: 'Sarah Chen', role: 'E-commerce Director', company: 'StyleHub', content: 'ClippingBD transformed our product photography workflow. 10x faster turnaround at 1/3 the cost of our previous solution. The quality is exceptional.', rating: 5, isPublished: true, sortOrder: 1 },
    { name: 'Michael Torres', role: 'Creative Director', company: 'BrandVision', content: 'The quality of their retouching work is exceptional. Perfect for high-end fashion campaigns where every detail matters.', rating: 5, isPublished: true, sortOrder: 2 },
    { name: 'Emma Wilson', role: 'Marketing Manager', company: 'TechGear', content: 'Their video editing team truly understands e-commerce. Our product videos have never looked better and conversions are up 40%.', rating: 5, isPublished: true, sortOrder: 3 },
    { name: 'David Kim', role: 'Founder & CEO', company: 'StartupBox', content: 'The web design team delivered our e-commerce platform in record time. Professional, responsive, and the final product exceeded expectations.', rating: 5, isPublished: true, sortOrder: 4 },
    { name: 'Lisa Anderson', role: 'Photography Director', company: 'Fashion Forward', content: 'We process thousands of images weekly and ClippingBD handles it flawlessly. The Nitro priority service is a game-changer.', rating: 5, isPublished: true, sortOrder: 5 },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log('✅ Seeded testimonials');

  // ============== SEED FAQ ITEMS ==============
  const faqItems = [
    { question: 'How do I get started?', answer: 'Simply create a free account, upload your images, and select the services you need. Our team will process your files and deliver them within the specified timeframe.', category: 'GENERAL', sortOrder: 1 },
    { question: 'What file formats do you support?', answer: 'We support all major image formats including JPEG, PNG, TIFF, PSD, AI, EPS, and RAW formats from all major camera manufacturers.', category: 'GENERAL', sortOrder: 2 },
    { question: 'How do you ensure quality?', answer: 'Every project goes through a multi-step quality control process. We offer unlimited revisions until you\'re completely satisfied.', category: 'GENERAL', sortOrder: 3 },
    { question: 'How is pricing calculated?', answer: 'Pricing is based on the service type, complexity, and volume. Higher volumes receive automatic discounts. Use our pricing calculator for accurate quotes.', category: 'PRICING', sortOrder: 4 },
    { question: 'Do you offer volume discounts?', answer: 'Yes! We offer automatic volume discounts: 5% off for 51-100 images, 10% off for 101-500, 15% off for 501-1000, and 20% off for 1000+ images.', category: 'PRICING', sortOrder: 5 },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, bank transfers, and cryptocurrency. Enterprise clients can request custom billing arrangements.', category: 'PRICING', sortOrder: 6 },
    { question: 'What is a clipping path?', answer: 'A clipping path is a vector outline used to remove the background from an image. It\'s the most precise method for background removal, perfect for e-commerce product photos.', category: 'SERVICES', sortOrder: 7 },
    { question: 'What\'s the difference between clipping path and image masking?', answer: 'Clipping paths are best for objects with hard, defined edges. Image masking is used for objects with soft or complex edges like hair, fur, or transparent objects.', category: 'SERVICES', sortOrder: 8 },
    { question: 'Do you offer API access?', answer: 'Yes! Our RESTful API allows you to integrate our services directly into your workflow. API access is available on Professional and Enterprise plans.', category: 'TECHNICAL', sortOrder: 9 },
    { question: 'What are webhooks?', answer: 'Webhooks allow you to receive real-time notifications when your projects are completed. You can set up webhook URLs in your account settings.', category: 'TECHNICAL', sortOrder: 10 },
  ];

  for (const faq of faqItems) {
    const existing = await prisma.fAQItem.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.fAQItem.create({ data: { ...faq, isPublished: true } });
    }
  }
  console.log('✅ Seeded FAQ items');

  // ============== SEED PORTFOLIO ITEMS ==============
  const portfolioItems = [
    { title: 'E-commerce Product Photography', description: 'Professional product clipping paths for online stores', category: 'CLIPPING_PATH', serviceType: 'IMAGE', beforeImage: '/portfolio/before-1.jpg', afterImage: '/portfolio/after-1.jpg', isPublished: true, sortOrder: 1 },
    { title: 'Fashion Retouching', description: 'High-end fashion photo retouching', category: 'RETOUCHING', serviceType: 'IMAGE', beforeImage: '/portfolio/before-2.jpg', afterImage: '/portfolio/after-2.jpg', isPublished: true, sortOrder: 2 },
    { title: 'Product Video Editing', description: 'Commercial and promotional video production', category: 'MOTION_GRAPHICS', serviceType: 'VIDEO', beforeImage: '/portfolio/before-video-1.jpg', afterImage: '/portfolio/after-video-1.jpg', isPublished: true, sortOrder: 3 },
  ];

  for (const item of portfolioItems) {
    const existing = await prisma.portfolioItem.findFirst({ where: { title: item.title } });
    if (!existing) {
      await prisma.portfolioItem.create({ data: item });
    }
  }
  console.log('✅ Seeded portfolio items');

  // ============== SEED CMS PAGES ==============
  const cmsPages = [
    { slug: 'home', title: 'Home', content: 'Welcome to ClippingBD Studio', isPublished: true, isHomePage: true },
    { slug: 'about', title: 'About Us', content: 'About ClippingBD Studio - Your trusted image editing partner', isPublished: true },
    { slug: 'services', title: 'Our Services', content: 'Comprehensive image and video editing services', isPublished: true },
    { slug: 'pricing', title: 'Pricing', content: 'Transparent pricing for all services', isPublished: true },
    { slug: 'portfolio', title: 'Portfolio', content: 'Our recent work and projects', isPublished: true },
    { slug: 'contact', title: 'Contact Us', content: 'Get in touch with our team', isPublished: true },
  ];

  for (const page of cmsPages) {
    const existing = await prisma.cMSPage.findFirst({ where: { slug: page.slug } });
    if (!existing) {
      await prisma.cMSPage.create({ data: page });
    }
  }
  console.log('✅ Seeded CMS pages');

  // ============== SEED CONTACT MESSAGES ==============
  const contacts = [
    { name: 'John Doe', email: 'john@example.com', subject: 'Inquiry about services', message: 'I am interested in your clipping path services. Please provide more information.', company: 'Example Corp', phone: '+1234567890' },
    { name: 'Jane Smith', email: 'jane@example.com', subject: 'Pricing question', message: 'Could you please provide a quote for 500 images?', company: 'Tech Solutions', phone: '+0987654321' },
  ];

  for (const contact of contacts) {
    await prisma.contact.create({ data: { ...contact, status: 'PENDING' } });
  }
  console.log('✅ Seeded contact messages');

  // ============== SEED PARTNER SITES ==============
  const partners = [
    { name: 'Shopify', url: 'https://shopify.com', description: 'E-commerce platform partner', isActive: true, sortOrder: 1 },
    { name: 'WooCommerce', url: 'https://woocommerce.com', description: 'WordPress e-commerce partner', isActive: true, sortOrder: 2 },
    { name: 'Amazon', url: 'https://amazon.com', description: 'Marketplace integration partner', isActive: true, sortOrder: 3 },
  ];

  for (const partner of partners) {
    const existing = await prisma.partnerSite.findFirst({ where: { name: partner.name } });
    if (!existing) {
      await prisma.partnerSite.create({ data: partner });
    }
  }
  console.log('✅ Seeded partner sites');

  // ============== SEED FEATURE FLAGS ==============
  const featureFlags = [
    { key: 'nitro_express', name: 'Nitro Express', description: '12-hour priority delivery service', enabled: true, rollout: 100 },
    { key: 'ai_automation', name: 'AI Automation', description: 'AI-powered background removal', enabled: true, rollout: 100 },
    { key: 'api_access', name: 'API Access', description: 'RESTful API for developers', enabled: true, rollout: 100 },
    { key: 'webhooks', name: 'Webhooks', description: 'Real-time webhook notifications', enabled: true, rollout: 100 },
  ];

  for (const flag of featureFlags) {
    const existing = await prisma.featureFlag.findFirst({ where: { key: flag.key } });
    if (!existing) {
      await prisma.featureFlag.create({ data: flag });
    }
  }
  console.log('✅ Seeded feature flags');

  console.log('🎉 Database seeded with all real data successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Admin: admin@clippingbd.com / password123');
  console.log('  Developer: developer@clippingbd.com / password123');
  console.log('  Client: client@example.com / password123');
  console.log('  Editor: editor1@clippingbd.com / password123');
  console.log('  QA: qa@clippingbd.com / password123');
  console.log('\n💳 Payment Gateways: Configure in Admin > Payments');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
>>>>>>> e295d53550430b8e2218d1d65ccc019b15c6121b
