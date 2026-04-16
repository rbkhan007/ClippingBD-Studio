// Features Data - Easily editable configuration
// Dev account can modify these values through the Admin CMS

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  category: 'why_us' | 'security' | 'nitro' | 'support' | 'platform';
  isVisible: boolean;
  isHighlighted: boolean;
  order: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'services' | 'technical' | 'account';
  isVisible: boolean;
  order: number;
}

export const featuresData: FeatureItem[] = [
  // Why Choose Us
  {
    id: 'feature_turnaround',
    title: '24-Hour Turnaround',
    description: 'Standard delivery within 24-48 hours. Rush delivery available for urgent projects.',
    icon: 'Clock',
    gradient: 'from-emerald-500 to-teal-500',
    category: 'why_us',
    isVisible: true,
    isHighlighted: true,
    order: 1,
  },
  {
    id: 'feature_secure',
    title: 'Secure & Confidential',
    description: 'NDA signing, encrypted file transfer, and secure storage for all your assets.',
    icon: 'Shield',
    gradient: 'from-teal-500 to-cyan-500',
    category: 'why_us',
    isVisible: true,
    isHighlighted: true,
    order: 2,
  },
  {
    id: 'feature_nitro',
    title: 'Nitro Express',
    description: '12-hour delivery with automatic priority handling and webhook notifications.',
    icon: 'Zap',
    gradient: 'from-cyan-500 to-blue-500',
    category: 'why_us',
    isVisible: true,
    isHighlighted: true,
    order: 3,
  },
  {
    id: 'feature_quality',
    title: 'Quality Guaranteed',
    description: 'Unlimited revisions until you\'re completely satisfied with the results.',
    icon: 'Award',
    gradient: 'from-blue-500 to-indigo-500',
    category: 'why_us',
    isVisible: true,
    isHighlighted: true,
    order: 4,
  },

  // Security Features
  {
    id: 'feature_encryption',
    title: 'End-to-End Encryption',
    description: 'All files are encrypted during transfer and storage using AES-256 encryption.',
    icon: 'Lock',
    gradient: 'from-emerald-500 to-teal-500',
    category: 'security',
    isVisible: true,
    isHighlighted: false,
    order: 5,
  },
  {
    id: 'feature_ndas',
    title: 'NDA Protection',
    description: 'All team members sign NDAs. Custom agreements available upon request.',
    icon: 'FileCheck',
    gradient: 'from-teal-500 to-cyan-500',
    category: 'security',
    isVisible: true,
    isHighlighted: false,
    order: 6,
  },
  {
    id: 'feature_compliance',
    title: 'GDPR Compliant',
    description: 'Fully compliant with GDPR and other international data protection regulations.',
    icon: 'CheckCircle',
    gradient: 'from-cyan-500 to-blue-500',
    category: 'security',
    isVisible: true,
    isHighlighted: false,
    order: 7,
  },

  // Support Features
  {
    id: 'feature_support_247',
    title: '24/7 Support',
    description: 'Round-the-clock customer support via chat, email, and phone.',
    icon: 'Headphones',
    gradient: 'from-emerald-500 to-teal-500',
    category: 'support',
    isVisible: true,
    isHighlighted: false,
    order: 8,
  },
  {
    id: 'feature_dedicated',
    title: 'Dedicated Manager',
    description: 'Professional plans include a dedicated account manager for personalized service.',
    icon: 'UserCheck',
    gradient: 'from-teal-500 to-cyan-500',
    category: 'support',
    isVisible: true,
    isHighlighted: false,
    order: 9,
  },
  {
    id: 'feature_knowledge',
    title: 'Knowledge Base',
    description: 'Comprehensive documentation, tutorials, and video guides.',
    icon: 'BookOpen',
    gradient: 'from-cyan-500 to-blue-500',
    category: 'support',
    isVisible: true,
    isHighlighted: false,
    order: 10,
  },

  // Platform Features
  {
    id: 'feature_api',
    title: 'RESTful API',
    description: 'Powerful API for seamless integration with your existing workflow.',
    icon: 'Code',
    gradient: 'from-emerald-500 to-teal-500',
    category: 'platform',
    isVisible: true,
    isHighlighted: false,
    order: 11,
  },
  {
    id: 'feature_webhooks',
    title: 'Webhooks',
    description: 'Real-time notifications for project updates and completions.',
    icon: 'Webhook',
    gradient: 'from-teal-500 to-cyan-500',
    category: 'platform',
    isVisible: true,
    isHighlighted: false,
    order: 12,
  },
  {
    id: 'feature_integrations',
    title: 'Integrations',
    description: 'Connect with Shopify, WooCommerce, Magento, and more.',
    icon: 'Plug',
    gradient: 'from-cyan-500 to-blue-500',
    category: 'platform',
    isVisible: true,
    isHighlighted: false,
    order: 13,
  },
];

export const faqData: FAQItem[] = [
  // General
  {
    id: 'faq_1',
    question: 'How do I get started?',
    answer: 'Simply create a free account, upload your images, and select the services you need. Our team will process your files and deliver them within the specified timeframe.',
    category: 'general',
    isVisible: true,
    order: 1,
  },
  {
    id: 'faq_2',
    question: 'What file formats do you support?',
    answer: 'We support all major image formats including JPEG, PNG, TIFF, PSD, AI, EPS, and RAW formats from all major camera manufacturers.',
    category: 'general',
    isVisible: true,
    order: 2,
  },
  {
    id: 'faq_3',
    question: 'How do you ensure quality?',
    answer: 'Every project goes through a multi-step quality control process. We offer unlimited revisions until you\'re completely satisfied.',
    category: 'general',
    isVisible: true,
    order: 3,
  },

  // Pricing
  {
    id: 'faq_4',
    question: 'How is pricing calculated?',
    answer: 'Pricing is based on the service type, complexity, and volume. Higher volumes receive automatic discounts. Use our pricing calculator for accurate quotes.',
    category: 'pricing',
    isVisible: true,
    order: 4,
  },
  {
    id: 'faq_5',
    question: 'Do you offer volume discounts?',
    answer: 'Yes! We offer automatic volume discounts: 5% off for 51-100 images, 10% off for 101-500, 15% off for 501-1000, and 20% off for 1000+ images.',
    category: 'pricing',
    isVisible: true,
    order: 5,
  },
  {
    id: 'faq_6',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, bank transfers, and cryptocurrency. Enterprise clients can request custom billing arrangements.',
    category: 'pricing',
    isVisible: true,
    order: 6,
  },

  // Services
  {
    id: 'faq_7',
    question: 'What is a clipping path?',
    answer: 'A clipping path is a vector outline used to remove the background from an image. It\'s the most precise method for background removal, perfect for e-commerce product photos.',
    category: 'services',
    isVisible: true,
    order: 7,
  },
  {
    id: 'faq_8',
    question: 'What\'s the difference between clipping path and image masking?',
    answer: 'Clipping paths are best for objects with hard, defined edges. Image masking is used for objects with soft or complex edges like hair, fur, or transparent objects.',
    category: 'services',
    isVisible: true,
    order: 8,
  },

  // Technical
  {
    id: 'faq_9',
    question: 'Do you offer API access?',
    answer: 'Yes! Our RESTful API allows you to integrate our services directly into your workflow. API access is available on Professional and Enterprise plans.',
    category: 'technical',
    isVisible: true,
    order: 9,
  },
  {
    id: 'faq_10',
    question: 'What are webhooks?',
    answer: 'Webhooks allow you to receive real-time notifications when your projects are completed. You can set up webhook URLs in your account settings.',
    category: 'technical',
    isVisible: true,
    order: 10,
  },

  // Account
  {
    id: 'faq_11',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send you a reset link. For security, the link expires after 24 hours.',
    category: 'account',
    isVisible: true,
    order: 11,
  },
  {
    id: 'faq_12',
    question: 'Can I have multiple team members on one account?',
    answer: 'Yes! All paid plans support multiple team members. The number of users depends on your plan: Starter (2), Professional (5), Enterprise (unlimited).',
    category: 'account',
    isVisible: true,
    order: 12,
  },
];

// Get features by category
export function getFeaturesByCategory(category: FeatureItem['category']): FeatureItem[] {
  return featuresData
    .filter(f => f.isVisible && f.category === category)
    .sort((a, b) => a.order - b.order);
}

// Get highlighted features
export function getHighlightedFeatures(): FeatureItem[] {
  return featuresData
    .filter(f => f.isVisible && f.isHighlighted)
    .sort((a, b) => a.order - b.order);
}

// Get FAQs by category
export function getFAQsByCategory(category: FAQItem['category']): FAQItem[] {
  return faqData
    .filter(f => f.isVisible && f.category === category)
    .sort((a, b) => a.order - b.order);
}

// Get all visible FAQs
export function getAllVisibleFAQs(): FAQItem[] {
  return faqData
    .filter(f => f.isVisible)
    .sort((a, b) => a.order - b.order);
}
