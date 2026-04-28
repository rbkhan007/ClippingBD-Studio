import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CMS tables with images...');

  // Clear existing data
  await prisma.cmsContactInfo.deleteMany({});
  await prisma.cmsSocialLink.deleteMany({});
  await prisma.cmsFaq.deleteMany({});
  await prisma.cmsTeamMember.deleteMany({});
  await prisma.cmsPortfolioItem.deleteMany({});
  await prisma.cmsTestimonial.deleteMany({});
  await prisma.cmsPricingTier.deleteMany({});
  await prisma.cmsService.deleteMany({});
  await prisma.cmsFeature.deleteMany({});
  await prisma.cmsStatistic.deleteMany({});
  await prisma.cmsHero.deleteMany({});
  await prisma.cmsGlobalSettings.deleteMany({});

  // Global Settings
  await prisma.cmsGlobalSettings.create({
    data: {
      siteName: 'ClippingBD Studio',
      tagline: 'Professional Image & Video Editing Services',
      description: 'ClippingBD Studio provides world-class image editing, video production, AI automation, and web development services for businesses worldwide.',
      footerText: '© 2026 ClippingBD Studio. All rights reserved.',
      primaryColor: '#00d4ff',
      secondaryColor: '#22d3ee',
      accentColor: '#f97316',
    },
  });
  console.log('✅ Global Settings created');

  // Hero Section
  await prisma.cmsHero.create({
    data: {
      headline: 'Professional Visual Content Services',
      subheadline: 'Transform Your Images & Videos with Expert Editing',
      description: 'From precision clipping paths to cinematic color grading, custom web development to AI automation — we deliver pixel-perfect results with lightning-fast turnaround.',
      ctaText: 'Start Free Trial',
      ctaUrl: '/auth',
      secondaryCtaText: 'View Portfolio',
      secondaryCtaUrl: '/portfolio',
      isActive: true,
    },
  });
  console.log('✅ Hero Section created');

  // Statistics
  const stats = [
    { label: 'Images Processed', value: '50', suffix: 'M+', icon: 'Image', order: 1 },
    { label: 'Videos Edited', value: '100', suffix: 'K+', icon: 'Video', order: 2 },
    { label: 'Happy Clients', value: '10', suffix: 'K+', icon: 'Users', order: 3 },
    { label: 'Countries Served', value: '120', suffix: '+', icon: 'Globe', order: 4 },
  ];

  for (const stat of stats) {
    await prisma.cmsStatistic.create({ data: { ...stat, isActive: true } });
  }
  console.log('✅ Statistics created');

  // Features
  const features = [
    { title: '24-Hour Turnaround', description: 'Rush delivery available for urgent projects with our Nitro Express service.', icon: 'Clock', order: 1 },
    { title: 'Secure & Confidential', description: 'NDA signing and encrypted file transfer for complete peace of mind.', icon: 'Shield', order: 2 },
    { title: 'Nitro Express', description: '12-hour delivery with automatic priority handling for time-sensitive projects.', icon: 'Zap', order: 3 },
    { title: 'Quality Guaranteed', description: 'Unlimited revisions until you\'re completely satisfied with the results.', icon: 'Award', order: 4 },
  ];

  for (const feature of features) {
    await prisma.cmsFeature.create({ data: { ...feature, isActive: true } });
  }
  console.log('✅ Features created');

  // Services with Images
  const services = [
    {
      title: 'Clipping Path',
      subtitle: 'Precision Background Removal',
      description: 'Expert path cutting for clean, accurate subject isolation. Perfect for e-commerce, catalogs, and advertising.',
      category: 'CLIPPING_PATH',
      priceFrom: 0.20,
      turnaround: '24 hours',
      icon: 'Layers',
      imageUrl: 'https://images.unsplash.com/photo-154漫道 intersection - image editing professionals',
      features: JSON.stringify(['Simple Clipping Path', 'Complex Paths', 'Multi-Channel Masking', 'Hair Masking']),
      order: 1,
    },
    {
      title: 'Image Editing',
      subtitle: 'Professional Photo Retouching',
      description: 'Advanced retouching, color correction, and image manipulation for stunning visual content.',
      category: 'IMAGE',
      priceFrom: 0.35,
      turnaround: '24 hours',
      icon: 'Palette',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop',
      features: JSON.stringify(['Retouching', 'Color Correction', 'Shadow Creation', 'Ghost Mannequin']),
      order: 2,
    },
    {
      title: 'Video Editing',
      subtitle: 'Cinematic Post-Production',
      description: 'Professional video editing, color grading, motion graphics, and post-production services.',
      category: 'VIDEO',
      priceFrom: 25.00,
      turnaround: '48 hours',
      icon: 'Video',
      imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
      features: JSON.stringify(['Video Editing', 'Color Grading', 'Motion Graphics', 'Audio Mixing']),
      order: 3,
    },
    {
      title: 'AI Operations',
      subtitle: 'Intelligent Automation',
      description: 'AI-powered image processing, batch operations, and custom machine learning solutions.',
      category: 'AI',
      priceFrom: 0.10,
      turnaround: '12 hours',
      icon: 'Bot',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      features: JSON.stringify(['Auto Background Removal', 'Batch Processing', 'Smart Resize', 'AI Enhancement']),
      order: 4,
    },
    {
      title: 'Web Development',
      subtitle: 'Custom Digital Solutions',
      description: 'Complete web design, e-commerce development, CMS integration, and custom web applications.',
      category: 'WEB',
      priceFrom: 500.00,
      turnaround: '7 days',
      icon: 'Code',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      features: JSON.stringify(['Website Design', 'E-commerce', 'CMS Setup', 'Web Applications']),
      order: 5,
    },
  ];

  for (const service of services) {
    await prisma.cmsService.create({ data: { ...service, isActive: true } });
  }
  console.log('✅ Services created with images');

  // Pricing Tiers
  const pricingTiers = [
    {
      name: 'Starter',
      price: 0,
      period: 'month',
      description: 'Perfect for small businesses and freelancers',
      features: JSON.stringify(['5 images/month', 'Basic clipping path', 'Email support', '24-hour turnaround']),
      isPopular: false,
      ctaText: 'Get Started Free',
      order: 1,
    },
    {
      name: 'Professional',
      price: 99,
      period: 'month',
      description: 'For growing agencies and e-commerce brands',
      features: JSON.stringify(['100 images/month', 'Advanced editing', 'Priority support', '12-hour turnaround', 'API access']),
      isPopular: true,
      ctaText: 'Start Trial',
      order: 2,
    },
    {
      name: 'Enterprise',
      price: 499,
      period: 'month',
      description: 'For large teams with high volume needs',
      features: JSON.stringify(['Unlimited images', 'All services included', 'Dedicated manager', '2-hour turnaround', 'Custom integrations', 'SLA guarantee']),
      isPopular: false,
      ctaText: 'Contact Sales',
      order: 3,
    },
  ];

  for (const tier of pricingTiers) {
    await prisma.cmsPricingTier.create({ data: { ...tier, isActive: true } });
  }
  console.log('✅ Pricing Tiers created');

  // Testimonials with Avatars
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'E-commerce Director',
      company: 'StyleHub',
      content: 'ClippingBD transformed our product photography workflow. 10x faster turnaround at 1/3 the cost compared to our previous vendor.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      order: 1,
    },
    {
      name: 'Michael Torres',
      role: 'Creative Director',
      company: 'BrandVision Media',
      content: 'The quality of their retouching work is exceptional. Perfect for high-end fashion campaigns and editorial content.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      order: 2,
    },
    {
      name: 'Emma Wilson',
      role: 'Marketing Manager',
      company: 'TechGear Solutions',
      content: 'Their video editing team understands e-commerce. Our product videos have never looked better, and conversion rates increased by 40%.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      order: 3,
    },
    {
      name: 'David Park',
      role: 'CEO',
      company: 'UrbanFashion Co.',
      content: 'The AI-powered batch processing is a game-changer. We went from processing 500 images in days to thousands in hours.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      order: 4,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.cmsTestimonial.create({ data: { ...testimonial, isActive: true } });
  }
  console.log('✅ Testimonials created with avatars');

  // Portfolio Items with Before/After Images
  const portfolioItems = [
    // Clipping Path Examples
    {
      title: 'Fashion Catalog Retouching',
      description: 'High-end fashion photography with expert retouching and color grading for luxury brand',
      beforeImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&sat=-100&con=-10',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      serviceType: 'IMAGE',
      category: 'RETOUCHING',
      clientName: 'Urban Fashion',
      order: 1,
    },
    {
      title: 'E-commerce Product Cutout',
      description: 'Clean background removal and enhancement for online store listings with pure white background',
      beforeImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      serviceType: 'CLIPPING_PATH',
      category: 'CLIPPING_PATH',
      clientName: 'TechStore BD',
      order: 2,
    },
    {
      title: 'Watch Product Photography',
      description: 'Precision clipping path for luxury watch with complex reflections and metallic surfaces',
      beforeImageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop',
      serviceType: 'CLIPPING_PATH',
      category: 'CLIPPING_PATH',
      clientName: 'LuxuryTimepieces',
      order: 3,
    },
    {
      title: 'Shoe Product Photography',
      description: 'Clean cutout for sports footwear with proper shadow and depth preservation',
      beforeImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
      serviceType: 'CLIPPING_PATH',
      category: 'CLIPPING_PATH',
      clientName: 'SportShoe Co.',
      order: 4,
    },
    {
      title: 'Jewelry Retouching',
      description: 'Expert retouching for gold and diamond jewelry with sparkle enhancement',
      beforeImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      serviceType: 'IMAGE',
      category: 'RETOUCHING',
      clientName: 'DiamondGem House',
      order: 5,
    },
    // Video Examples
    {
      title: 'Product Video Showcase',
      description: 'Cinematic product video with motion graphics and color grading for marketing campaign',
      beforeImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      serviceType: 'VIDEO',
      category: 'VIDEO_EDITING',
      clientName: 'AudioMax',
      order: 6,
    },
    {
      title: 'Fashion Model Video Edit',
      description: 'Professional video editing with color grading for fashion brand campaign',
      beforeImageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop',
      serviceType: 'VIDEO',
      category: 'VIDEO_EDITING',
      clientName: 'VogueStyle',
      order: 7,
    },
    // AI Examples
    {
      title: 'Batch Background Removal',
      description: 'AI-powered batch processing for 500+ product images with consistent quality',
      beforeImageUrl: 'https://images.unsplash.com/photo-1491553895911-0055uj8d53fa?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1491553895911-0055uj8d53fa?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1491553895911-0055uj8d53fa?w=400&h=300&fit=crop',
      serviceType: 'AI',
      category: 'AI_PROCESSING',
      clientName: 'GlobalRetailer',
      order: 8,
    },
    // Image Editing Examples
    {
      title: 'Ghost Mannequin Effect',
      description: 'Professional ghost mannequin effect for apparel photography with invisible mannequin',
      beforeImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=300&fit=crop',
      serviceType: 'IMAGE',
      category: 'RETOUCHING',
      clientName: 'FashionForward',
      order: 9,
    },
    {
      title: 'Color Correction Service',
      description: 'Professional color grading and correction for consistent brand imagery',
      beforeImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      serviceType: 'IMAGE',
      category: 'COLOR_CORRECTION',
      clientName: 'TravelMagazine',
      order: 10,
    },
    // Additional Services
    {
      title: 'Hair Masking Complex Cutout',
      description: 'Advanced hair masking for portrait photography with natural edge preservation',
      beforeImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop',
      serviceType: 'CLIPPING_PATH',
      category: 'MASKING',
      clientName: 'BeautyBrand',
      order: 11,
    },
    {
      title: 'Furniture Product Photography',
      description: 'Clean cutout for furniture photography with natural shadow preservation',
      beforeImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
      afterImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&sat=-100',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
      serviceType: 'CLIPPING_PATH',
      category: 'CLIPPING_PATH',
      clientName: 'HomeDecor Plus',
      order: 12,
    },
  ];

  for (const item of portfolioItems) {
    await prisma.cmsPortfolioItem.create({ data: { ...item, isActive: true } });
  }
  console.log('✅ Portfolio Items created with before/after images');

  // Team Members with Avatars
  const teamMembers = [
    {
      name: 'Belal Sarker',
      role: 'Founder & CEO',
      bio: 'Visionary leader with 15+ years in image editing and web development. Founded ClippingBD to democratize professional visual content services.',
      email: 'belal@clippingbd.com',
      linkedin: 'https://linkedin.com/in/belalsarker',
      twitter: 'https://twitter.com/belal',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Belal&backgroundColor=c0aede',
      order: 1,
    },
    {
      name: 'Rakibul Hasan',
      role: 'Lead Developer & Designer',
      bio: 'Full-stack developer and UI/UX designer. Architect behind ClippingBD\'s digital infrastructure specializing in Next.js and React.',
      email: 'rakib@clippingbd.com',
      linkedin: 'https://linkedin.com/in/rakibulhasan',
      twitter: 'https://twitter.com/rakibdev',
      avatarUrl: '/images/Rakibul Hasan.JPG',
      order: 2,
    },
    {
      name: 'A.R. Ashik',
      role: 'QA & Bug Tester',
      bio: 'Expert in quality assurance and bug detection. Ensures every deliverable meets the highest standards of quality before final delivery to clients.',
      email: 'ashik@clippingbd.com',
      linkedin: 'https://linkedin.com/in/ashik',
      avatarUrl: '/images/A.R.Ashik.jpeg',
      order: 3,
    },
    {
      name: 'Ahmed Khan',
      role: 'Lead Video Editor',
      bio: 'Award-winning cinematographer specializing in color grading and motion graphics with 10+ years experience.',
      email: 'ahmed@clippingbd.com',
      linkedin: 'https://linkedin.com/in/ahmedkhan',
      twitter: 'https://twitter.com/ahmedkhan',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed&backgroundColor=d1d4f9',
      order: 4,
    },
    {
      name: 'Priya Sharma',
      role: 'Senior Image Editor',
      bio: 'Expert in complex masking and retouching. Specializes in beauty and fashion photography enhancement.',
      email: 'priya@clippingbd.com',
      linkedin: 'https://linkedin.com/in/priyasharma',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffdfbf',
      order: 5,
    },
    {
      name: 'James Wilson',
      role: 'QA Lead',
      bio: 'Quality assurance expert ensuring every deliverable meets client expectations. 8+ years in image editing QC.',
      email: 'james@clippingbd.com',
      linkedin: 'https://linkedin.com/in/jameswilson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=c0aede',
      order: 6,
    },
  ];

  for (const member of teamMembers) {
    await prisma.cmsTeamMember.create({ data: { ...member, isActive: true } });
  }
  console.log('✅ Team Members created with avatars');

  // FAQs
  const faqs = [
    { question: 'What is your typical turnaround time?', answer: 'Standard delivery is 24 hours. We also offer express 12-hour delivery (Nitro) for urgent projects.', category: 'SERVICES', order: 1 },
    { question: 'Do you offer free trials?', answer: 'Yes! We offer free test images for new clients. No credit card required. Upload your images and see the quality yourself.', category: 'SERVICES', order: 2 },
    { question: 'What payment methods do you accept?', answer: 'We accept PayPal, Stripe, Payoneer, bKash, and Nagad. Enterprise clients can request invoice-based billing.', category: 'PRICING', order: 3 },
    { question: 'How do I get a custom quote?', answer: 'Upload your images through our client portal and our system will automatically generate a quote. For complex projects, contact our sales team directly.', category: 'PRICING', order: 4 },
    { question: 'What file formats do you support?', answer: 'We accept JPEG, PNG, TIFF, PSD, RAW, AI, EPS, PDF, and more. We can also work with video formats including MP4, MOV, and AVI.', category: 'SERVICES', order: 5 },
    { question: 'Is my data secure?', answer: 'Absolutely. All files are encrypted in transit (TLS 1.3) and at rest. We sign NDAs upon request and automatically delete files after project completion.', category: 'SUPPORT', order: 6 },
  ];

  for (const faq of faqs) {
    await prisma.cmsFaq.create({ data: { ...faq, isActive: true } });
  }
  console.log('✅ FAQs created');

  // Social Links
  const socialLinks = [
    { platform: 'facebook', url: 'https://facebook.com/clippingbd', icon: 'Facebook', order: 1 },
    { platform: 'twitter', url: 'https://twitter.com/clippingbd', icon: 'Twitter', order: 2 },
    { platform: 'instagram', url: 'https://instagram.com/clippingbd', icon: 'Instagram', order: 3 },
    { platform: 'linkedin', url: 'https://linkedin.com/company/clippingbd', icon: 'Linkedin', order: 4 },
    { platform: 'youtube', url: 'https://youtube.com/@clippingbd', icon: 'Youtube', order: 5 },
  ];

  for (const link of socialLinks) {
    await prisma.cmsSocialLink.create({ data: { ...link, isActive: true } });
  }
  console.log('✅ Social Links created');

  // Contact Info
  const contactInfoData = [
    { type: 'email', label: 'Email', value: 'info@clippingbd.com', icon: 'Mail', link: 'mailto:info@clippingbd.com', order: 1 },
    { type: 'phone', label: 'Phone', value: '+880 1749 616724', icon: 'Phone', link: 'tel:+8801749616724', order: 2 },
    { type: 'whatsapp', label: 'WhatsApp', value: '+880 1749 616724', icon: 'MessageCircle', link: 'https://wa.me/8801749616724', order: 3 },
    { type: 'hours', label: 'Working Hours', value: '24/7 Support', icon: 'Clock', order: 4 },
    { type: 'address', label: 'Headquarters', value: 'Chirirbandar, Dinajpur, Bangladesh', icon: 'MapPin', order: 5 },
  ];

  for (const info of contactInfoData) {
    await prisma.cmsContactInfo.create({ data: { ...info, isPublic: true } });
  }
  console.log('✅ Contact Info created');

  // Partners
  const partners = [
    { name: 'Shopify', websiteUrl: 'https://shopify.com', description: 'E-commerce Platform Partner', logoUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=200&h=100&fit=crop', order: 1 },
    { name: 'WooCommerce', websiteUrl: 'https://woocommerce.com', description: 'WordPress E-commerce Partner', logoUrl: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=200&h=100&fit=crop', order: 2 },
    { name: 'BigCommerce', websiteUrl: 'https://bigcommerce.com', description: 'Enterprise E-commerce Partner', logoUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=100&fit=crop', order: 3 },
  ];

  for (const partner of partners) {
    await prisma.cmsPartner.create({ data: { ...partner, isActive: true } });
  }
  console.log('✅ Partners created');

  console.log('\n🎉 CMS seeding completed successfully!');
  console.log('📊 Summary:');
  console.log('   - Services: 5 with images');
  console.log('   - Portfolio Items: 12 with before/after images');
  console.log('   - Testimonials: 4 with avatars');
  console.log('   - Team Members: 6 with avatars');
  console.log('   - FAQs: 6 questions');
  console.log('   - Social Links: 5 platforms');
  console.log('   - Contact Info: 5 methods');
}

main()
  .catch((e) => {
    console.error('Error seeding CMS:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
