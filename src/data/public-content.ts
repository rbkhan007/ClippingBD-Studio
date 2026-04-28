// Public Page Content - Hero sections, CTAs, and marketing content
// This file contains all public-facing content that can impress clients
// DEV accounts can modify, ADMIN can manage through CMS

export interface HeroContent {
  id: string;
  page: string;
  badge: {
    icon: string;
    text: string;
  };
  headline: {
    line1: string;
    highlight: string;
    line2: string;
  };
  description: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
    icon: string;
  };
  trustBadges?: string[];
}

export interface ServiceHighlight {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  pricing: {
    starting: string;
    unit: string;
  };
  stats: {
    value: string;
    label: string;
  };
  gradient: string;
  icon: string;
}

export interface WhyChooseUs {
  id: string;
  icon: string;
  title: string;
  description: string;
  stats?: {
    value: string;
    label: string;
  };
  gradient: string;
}

export interface ClientBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export interface CaseStudy {
  id: string;
  client: string;
  industry: string;
  title: string;
  description: string;
  results: {
    metric: string;
    value: string;
    improvement: string;
  }[];
  services: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  gradient: string;
}

// ============================================
// HOME PAGE HERO
// ============================================
export const homeHero: HeroContent = {
  id: 'home_hero',
  page: 'home',
  badge: {
    icon: 'Sparkles',
    text: 'World\'s #1 Image Editing Partner for E-commerce',
  },
  headline: {
    line1: 'Transform Your',
    highlight: 'Visual Content',
    line2: 'Into Sales Magnets',
  },
  description: 'Industry-leading clipping path, image editing, and video production services trusted by 10,000+ brands worldwide. Lightning-fast delivery, pixel-perfect quality, and prices that scale with your business.',
  primaryCTA: {
    text: 'Start Free Trial',
    href: '/auth/signup',
  },
  secondaryCTA: {
    text: 'View Our Work',
    href: '/portfolio',
    icon: 'Play',
  },
  trustBadges: [
    'Amazon Preferred Partner',
    'Shopify Expert',
    'ISO 27001 Certified',
    'GDPR Compliant',
  ],
};

// ============================================
// SERVICE HIGHLIGHTS (Impressive Details)
// ============================================
export const serviceHighlights: ServiceHighlight[] = [
  {
    id: 'clipping_path',
    title: 'Precision Clipping Path',
    subtitle: 'Pixel-Perfect Background Removal',
    description: 'Hand-crafted clipping paths by expert editors who understand e-commerce. Every curve, every edge is traced with surgical precision for backgrounds that vanish seamlessly.',
    features: [
      '100% Hand-drawn paths (no auto-selection)',
      'Up to 4000+ anchor points for complex items',
      'Transparent, white, or custom backgrounds',
      'Layered PSD/PSB delivery with editable paths',
      'Jewelry, fashion, electronics, furniture experts',
      'Amazon, eBay, Walmart compliance ready',
    ],
    pricing: {
      starting: '$0.20',
      unit: '/image',
    },
    stats: {
      value: '50M+',
      label: 'Images Processed',
    },
    gradient: 'from-emerald-500 to-green-600',
    icon: 'Layers',
  },
  {
    id: 'image_editing',
    title: 'Professional Image Editing',
    subtitle: 'Make Every Photo Sell',
    description: 'From basic retouching to high-end beauty edits, our team transforms ordinary photos into conversion-driving assets. Color correction, shadow creation, and ghost mannequin services included.',
    features: [
      'High-end skin & beauty retouching',
      'Natural shadow & reflection creation',
      'Ghost mannequin for fashion brands',
      'Color matching across product lines',
      'Batch processing for consistent look',
      'Raw to final delivery workflow',
    ],
    pricing: {
      starting: '$0.30',
      unit: '/image',
    },
    stats: {
      value: '25M+',
      label: 'Photos Enhanced',
    },
    gradient: 'from-teal-500 to-cyan-600',
    icon: 'Image',
  },
  {
    id: 'video_services',
    title: 'Cinematic Video Production',
    subtitle: 'Videos That Stop The Scroll',
    description: 'Turn raw footage into scroll-stopping content. From 15-second Reels to full product videos, our editors bring cinematic quality to every frame.',
    features: [
      'Social media Reels & TikToks',
      'Product demo videos',
      'Motion graphics & animations',
      'Professional color grading',
      'Subtitles in 50+ languages',
      '4K delivery with source files',
    ],
    pricing: {
      starting: '$15',
      unit: '/video',
    },
    stats: {
      value: '100K+',
      label: 'Videos Created',
    },
    gradient: 'from-cyan-500 to-blue-600',
    icon: 'Video',
  },
  {
    id: 'ai_automation',
    title: 'AI-Powered Automation',
    subtitle: 'Scale Without Limits',
    description: 'Harness the power of AI to process thousands of images in minutes. Our custom models deliver consistent results while reducing costs by up to 70%.',
    features: [
      'Instant background removal',
      'Smart object detection & tagging',
      'Automated product cropping',
      'API integration with your workflow',
      'Custom AI model training',
      'Real-time webhook notifications',
    ],
    pricing: {
      starting: '$0.05',
      unit: '/image',
    },
    stats: {
      value: '1M+',
      label: 'Tasks Automated Daily',
    },
    gradient: 'from-blue-500 to-indigo-600',
    icon: 'Bot',
  },
  {
    id: 'web_design',
    title: 'Web Design Studio',
    subtitle: 'Digital Experiences That Convert',
    description: 'From concept to launch, we build high-performance websites and e-commerce platforms that turn visitors into customers. Mobile-first, SEO-optimized, and blazing fast.',
    features: [
      'Custom e-commerce development',
      'Shopify & WooCommerce experts',
      'Progressive Web Apps (PWA)',
      'UI/UX design & prototyping',
      'Payment gateway integration',
      'Ongoing maintenance & support',
    ],
    pricing: {
      starting: '$999',
      unit: 'per project',
    },
    stats: {
      value: '500+',
      label: 'Sites Launched',
    },
    gradient: 'from-indigo-500 to-purple-600',
    icon: 'Globe',
  },
];

// ============================================
// WHY CHOOSE US (Impressive Features)
// ============================================
export const whyChooseUs: WhyChooseUs[] = [
  {
    id: 'turnaround',
    icon: 'Clock',
    title: 'Lightning-Fast Turnaround',
    description: 'Standard 24-48 hour delivery. Need it faster? Our Nitro Express delivers in just 12 hours without compromising quality.',
    stats: { value: '18h', label: 'Average Delivery' },
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'quality',
    icon: 'Award',
    title: 'Pixel-Perfect Quality',
    description: 'Triple-layer quality check by senior editors. Zoom to 400% - if we find one pixel out of place, we redo it.',
    stats: { value: '99.8%', label: 'First-Time Approval' },
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'security',
    icon: 'Shield',
    title: 'Bank-Level Security',
    description: 'End-to-end AES-256 encryption, NDA-signed editors, and GDPR-compliant data handling. Your assets are safer than your bank account.',
    stats: { value: '0', label: 'Security Breaches Ever' },
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'pricing',
    icon: 'DollarSign',
    title: 'Volume Discounts That Scale',
    description: 'The more you edit, the more you save. Up to 40% off for high-volume clients. No contracts, no minimums, no surprises.',
    stats: { value: '40%', label: 'Max Discount' },
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'support',
    icon: 'Headphones',
    title: '24/7 Dedicated Support',
    description: 'Real humans, not chatbots. Get a dedicated account manager who knows your brand guidelines by heart.',
    stats: { value: '<5min', label: 'Avg Response Time' },
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'revisions',
    icon: 'RefreshCw',
    title: 'Unlimited Revisions',
    description: 'Not happy? We\'ll revise until you are. No extra charge, no questions asked. Your satisfaction is our success metric.',
    stats: { value: '∞', label: 'Free Revisions' },
    gradient: 'from-purple-500 to-pink-500',
  },
];

// ============================================
// CLIENT BENEFITS
// ============================================
export const clientBenefits: ClientBenefit[] = [
  {
    id: 'free_trial',
    icon: 'Gift',
    title: '3 Free Test Images',
    description: 'Try our quality with zero commitment. Upload 3 images and see the difference yourself.',
    highlight: true,
  },
  {
    id: 'no_minimum',
    icon: 'Minus',
    title: 'No Minimum Order',
    description: 'Edit 1 image or 10,000. No contracts, no monthly fees, no hidden charges.',
  },
  {
    id: 'instant_quote',
    icon: 'Calculator',
    title: 'Instant Pricing',
    description: 'Upload your images and get an accurate quote in seconds. No waiting for sales calls.',
  },
  {
    id: 'easy_upload',
    icon: 'Upload',
    title: 'Easy Upload System',
    description: 'Drag & drop up to 500 images at once. We support all major formats including RAW.',
  },
  {
    id: 'real_time',
    icon: 'Activity',
    title: 'Real-Time Tracking',
    description: 'Watch your projects progress in real-time. Get notified the moment they\'re ready.',
  },
  {
    id: 'api_access',
    icon: 'Code',
    title: 'Developer API',
    description: 'Integrate our services directly into your workflow with our RESTful API.',
  },
];

// ============================================
// IMPRESSIVE STATS
// ============================================
export const impressiveStats = [
  { value: '50M+', label: 'Images Processed', description: 'And counting, every single day', icon: 'Image' },
  { value: '100K+', label: 'Videos Created', description: 'From 15-second clips to full productions', icon: 'Video' },
  { value: '10,000+', label: 'Happy Clients', description: 'In 120+ countries worldwide', icon: 'Users' },
  { value: '99.8%', label: 'Satisfaction Rate', description: 'Based on 50,000+ reviews', icon: 'Star' },
  { value: '18h', label: 'Average Turnaround', description: 'From upload to delivery', icon: 'Clock' },
  { value: '$0.20', label: 'Starting Price', description: 'Per image, no hidden fees', icon: 'DollarSign' },
];

// ============================================
// CASE STUDIES
// ============================================
export const caseStudies: CaseStudy[] = [
  {
    id: 'fashion_brand',
    client: 'StyleHub',
    industry: 'Fashion E-commerce',
    title: '10x Faster Product Listings',
    description: 'How we helped a fast-growing fashion brand reduce their image editing time from 5 days to 12 hours, enabling same-day product launches.',
    results: [
      { metric: 'Editing Time', value: '12h', improvement: '-90%' },
      { metric: 'Cost Per Image', value: '$0.35', improvement: '-65%' },
      { metric: 'Conversion Rate', value: '+23%', improvement: '+23%' },
    ],
    services: ['Clipping Path', 'Shadow Creation', 'Color Correction'],
    testimonial: {
      quote: 'ClippingBD transformed our workflow. What used to take a week now happens overnight.',
      author: 'Sarah Chen',
      role: 'E-commerce Director',
    },
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'electronics_retailer',
    client: 'TechGear Pro',
    industry: 'Consumer Electronics',
    title: 'Amazon Compliance at Scale',
    description: 'Processing 50,000+ product images monthly for Amazon compliance while maintaining consistent quality across all marketplaces.',
    results: [
      { metric: 'Monthly Images', value: '50K+', improvement: 'Scale' },
      { metric: 'Amazon Rejection', value: '0.1%', improvement: '-99%' },
      { metric: 'Cost Savings', value: '$12K/mo', improvement: 'vs In-house' },
    ],
    services: ['Background Removal', 'Infographics', 'Lifestyle Edits'],
    testimonial: {
      quote: 'Our Amazon listings have never looked better. Zero rejections in 6 months.',
      author: 'Michael Torres',
      role: 'Marketplace Manager',
    },
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'jewelry_brand',
    client: 'Luxe Gems',
    industry: 'Fine Jewelry',
    title: 'Capturing Every Sparkle',
    description: 'Complex clipping paths for intricate jewelry pieces. Our editors handle chains, settings, and gemstones with precision that showcases every detail.',
    results: [
      { metric: 'Complexity Level', value: 'Super', improvement: 'Complex' },
      { metric: 'Average Anchor Points', value: '2,500+', improvement: 'Precision' },
      { metric: 'Client Retention', value: '3 yrs', improvement: 'Ongoing' },
    ],
    services: ['Super Complex Path', 'Shadow & Reflection', 'Color Correction'],
    testimonial: {
      quote: 'They capture details we didn\'t even know were visible. True craftsmanship.',
      author: 'Jennifer Lee',
      role: 'Brand Manager',
    },
    gradient: 'from-cyan-500 to-blue-600',
  },
];

// ============================================
// PROCESS STEPS
// ============================================
export const processSteps = [
  {
    step: 1,
    title: 'Upload',
    description: 'Drag & drop your images or use our API. We accept all formats up to 100MB each.',
    icon: 'Upload',
  },
  {
    step: 2,
    title: 'Specify',
    description: 'Tell us what you need - clipping path, retouching, background color, and more.',
    icon: 'Settings',
  },
  {
    step: 3,
    title: 'We Edit',
    description: 'Expert editors process your images with precision and care.',
    icon: 'Edit',
  },
  {
    step: 4,
    title: 'Review',
    description: 'Preview your edited images and request any revisions.',
    icon: 'Eye',
  },
  {
    step: 5,
    title: 'Download',
    description: 'Download your pixel-perfect images in your preferred format.',
    icon: 'Download',
  },
];

// ============================================
// GUARANTEES
// ============================================
export const guarantees = [
  {
    icon: 'Shield',
    title: '100% Satisfaction Guarantee',
    description: 'Not happy? We\'ll revise until you are, at no extra cost.',
  },
  {
    icon: 'Clock',
    title: 'On-Time Delivery Promise',
    description: 'Missed deadline? Your order is free. That\'s our commitment.',
  },
  {
    icon: 'Lock',
    title: 'Data Security Promise',
    description: 'Your files are encrypted and deleted after 30 days. Never shared.',
  },
  {
    icon: 'CreditCard',
    title: 'No Hidden Fees',
    description: 'The price you see is the price you pay. No surprises, ever.',
  },
];

// ============================================
// INTEGRATIONS
// ============================================
export const integrations = [
  { name: 'Shopify', icon: 'ShoppingCart', description: 'Auto-sync product images' },
  { name: 'WooCommerce', icon: 'Store', description: 'WordPress integration' },
  { name: 'Magento', icon: 'Box', description: 'Adobe Commerce ready' },
  { name: 'Amazon', icon: 'Package', description: 'Marketplace compliance' },
  { name: 'eBay', icon: 'Tag', description: 'Listing optimization' },
  { name: 'API', icon: 'Code', description: 'Custom integration' },
];

// ============================================
// SOCIAL PROOF
// ============================================
export const socialProof = {
  totalClients: '10,000+',
  countriesServed: '120+',
  totalImagesProcessed: '50M+',
  averageRating: '4.9/5',
  reviewCount: '50,000+',
  repeatClientRate: '94%',
};

// Helper functions
export function getServiceHighlight(id: string): ServiceHighlight | undefined {
  return serviceHighlights.find(s => s.id === id);
}

export function getCaseStudy(id: string): CaseStudy | undefined {
  return caseStudies.find(c => c.id === id);
}

// ============================================
// ADDITIONAL SERVICES BY CATEGORY (Tabbed)
// ============================================
export interface AdditionalService {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  services: AdditionalService[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'image_editing',
    name: 'Image Editing',
    icon: 'Image',
    gradient: 'from-emerald-500 to-green-600',
    services: [
      { id: 'clipping_path', title: 'Clipping Path', description: 'Precision background removal with hand-drawn paths', price: 'From $0.20', icon: 'Layers', popular: true },
      { id: 'background_removal', title: 'Background Removal', description: 'Clean cutouts for products and portraits', price: 'From $0.15', icon: 'Layers' },
      { id: 'image_masking', title: 'Image Masking', description: 'Complex edges like hair, fur, and transparency', price: 'From $0.50', icon: 'Wand2' },
      { id: 'shadow_creation', title: 'Shadow Creation', description: 'Natural, drop, and reflection shadows', price: 'From $0.25', icon: 'Layers' },
      { id: 'color_correction', title: 'Color Correction', description: 'White balance, exposure, and color matching', price: 'From $0.20', icon: 'Palette' },
      { id: 'photo_retouching', title: 'Photo Retouching', description: 'Skin, product, and beauty retouching', price: 'From $0.50', icon: 'Sparkles' },
      { id: 'ghost_mannequin', title: 'Ghost Mannequin', description: 'Invisible mannequin effect for fashion', price: 'From $1.00', icon: 'User' },
      { id: 'image_composite', title: 'Image Composite', description: 'Combine multiple images seamlessly', price: 'From $2.00', icon: 'Layers' },
    ],
  },
  {
    id: 'video_services',
    name: 'Video Services',
    icon: 'Video',
    gradient: 'from-cyan-500 to-blue-600',
    services: [
      { id: 'video_editing', title: 'Video Editing', description: 'Professional cuts, transitions, and storytelling', price: 'From $15', icon: 'Video', popular: true },
      { id: 'color_grading', title: 'Color Grading', description: 'Cinematic color correction for any mood', price: 'From $25', icon: 'Palette' },
      { id: 'motion_graphics', title: 'Motion Graphics', description: 'Animations, titles, and visual effects', price: 'From $50', icon: 'Sparkles' },
      { id: 'subtitles', title: 'Subtitles & Captions', description: 'Multi-language subtitles and captions', price: 'From $5', icon: 'FileText' },
      { id: 'social_reels', title: 'Social Media Reels', description: 'TikTok, Reels, Shorts optimization', price: 'From $15', icon: 'Video' },
      { id: 'product_videos', title: 'Product Videos', description: 'Demo videos and product showcases', price: 'From $30', icon: 'Package' },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: 'ShoppingCart',
    gradient: 'from-teal-500 to-cyan-600',
    services: [
      { id: 'amazon_photos', title: 'Amazon Product Photos', description: 'Main images, infographics, lifestyle', price: 'From $5', icon: 'Package', popular: true },
      { id: 'ebay_photos', title: 'eBay Listing Photos', description: 'Optimized for eBay requirements', price: 'From $3', icon: 'Tag' },
      { id: 'shopify_editing', title: 'Shopify Product Editing', description: 'Store-ready product images', price: 'From $2', icon: 'ShoppingCart' },
      { id: 'product_infographics', title: 'Product Infographics', description: 'Feature highlights and comparisons', price: 'From $10', icon: 'Layout' },
      { id: 'lifestyle_images', title: 'Lifestyle Images', description: 'Context and usage scenarios', price: 'From $15', icon: 'Image' },
      { id: '360_spin', title: '360° Product Spin', description: 'Interactive product viewers', price: 'From $25', icon: 'RotateCcw' },
    ],
  },
  {
    id: 'ai_services',
    name: 'AI Services',
    icon: 'Bot',
    gradient: 'from-blue-500 to-indigo-600',
    services: [
      { id: 'ai_background', title: 'AI Background Removal', description: 'Instant background removal at scale', price: 'From $0.05', icon: 'Zap', popular: true },
      { id: 'ai_upscaling', title: 'AI Image Upscaling', description: 'Enhance resolution up to 4K', price: 'From $0.15', icon: 'Maximize' },
      { id: 'ai_restoration', title: 'AI Photo Restoration', description: 'Restore damaged vintage photos', price: 'From $1.00', icon: 'RefreshCw' },
      { id: 'ai_enhancement', title: 'AI Image Enhancement', description: 'Auto-enhance colors and details', price: 'From $0.10', icon: 'Sparkles' },
      { id: 'ai_tagging', title: 'AI Object Tagging', description: 'Automatic product recognition', price: 'From $0.02', icon: 'Tag' },
      { id: 'api_access', title: 'API Integration', description: 'Connect to your workflow', price: 'Custom', icon: 'Code' },
    ],
  },
  {
    id: 'web_design',
    name: 'Web Design',
    icon: 'Globe',
    gradient: 'from-indigo-500 to-purple-600',
    services: [
      { id: 'website_design', title: 'Custom Website Design', description: 'Beautiful, responsive websites', price: 'From $2,500', icon: 'Globe', popular: true },
      { id: 'ecommerce_site', title: 'E-commerce Development', description: 'Full online store setup', price: 'From $3,500', icon: 'ShoppingCart' },
      { id: 'ui_ux', title: 'UI/UX Design', description: 'User-centered design systems', price: 'From $1,500', icon: 'Layout' },
      { id: 'landing_pages', title: 'Landing Pages', description: 'Conversion-focused single pages', price: 'From $500', icon: 'Layout' },
      { id: 'shopify_theme', title: 'Shopify Theme Dev', description: 'Custom Shopify themes', price: 'From $2,000', icon: 'Store' },
      { id: 'maintenance', title: 'Website Maintenance', description: 'Ongoing support and updates', price: 'From $200/mo', icon: 'Settings' },
    ],
  },
  {
    id: 'specialized',
    name: 'Specialized',
    icon: 'Star',
    gradient: 'from-purple-500 to-pink-600',
    services: [
      { id: 'jewelry_editing', title: 'Jewelry Editing', description: 'Super complex paths for fine jewelry', price: 'From $1.50', icon: 'Diamond', popular: true },
      { id: 'automotive', title: 'Automotive Editing', description: 'Car photo enhancement and composites', price: 'From $5.00', icon: 'Car' },
      { id: 'real_estate', title: 'Real Estate Editing', description: 'HDR, sky replacement, virtual staging', price: 'From $2.00', icon: 'Home' },
      { id: 'fashion_editing', title: 'Fashion Editing', description: 'High-end editorial retouching', price: 'From $3.00', icon: 'Shirt' },
      { id: 'food_photography', title: 'Food Photography', description: 'Appetizing food photo editing', price: 'From $2.50', icon: 'Utensils' },
      { id: 'wedding_photos', title: 'Wedding Photos', description: 'Wedding album curation and editing', price: 'From $0.75', icon: 'Heart' },
    ],
  },
];
