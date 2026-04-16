// Testimonials Data - Easily editable configuration
// Dev account can modify these values through the Admin CMS

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number; // 1-5 stars
  avatar: string; // URL or initials
  isVisible: boolean;
  isFeatured: boolean;
  category: 'image' | 'video' | 'web' | 'ai' | 'general';
  order: number;
  createdAt: string;
}

export const testimonialsData: TestimonialItem[] = [
  {
    id: 'testimonial_1',
    name: 'Sarah Chen',
    role: 'E-commerce Director',
    company: 'StyleHub',
    content: 'ClippingBD transformed our product photography workflow. 10x faster turnaround at 1/3 the cost of our previous solution. The quality is exceptional and the team is incredibly responsive.',
    rating: 5,
    avatar: 'SC',
    isVisible: true,
    isFeatured: true,
    category: 'image',
    order: 1,
    createdAt: '2024-01-15',
  },
  {
    id: 'testimonial_2',
    name: 'Michael Torres',
    role: 'Creative Director',
    company: 'BrandVision',
    content: 'The quality of their retouching work is exceptional. Perfect for high-end fashion campaigns where every detail matters. We\'ve been working with them for over 2 years now.',
    rating: 5,
    avatar: 'MT',
    isVisible: true,
    isFeatured: true,
    category: 'image',
    order: 2,
    createdAt: '2024-02-20',
  },
  {
    id: 'testimonial_3',
    name: 'Emma Wilson',
    role: 'Marketing Manager',
    company: 'TechGear',
    content: 'Their video editing team truly understands e-commerce. Our product videos have never looked better and conversions are up 40% since we started using their services.',
    rating: 5,
    avatar: 'EW',
    isVisible: true,
    isFeatured: true,
    category: 'video',
    order: 3,
    createdAt: '2024-03-10',
  },
  {
    id: 'testimonial_4',
    name: 'David Kim',
    role: 'Founder & CEO',
    company: 'StartupBox',
    content: 'The web design team delivered our e-commerce platform in record time. Professional, responsive, and the final product exceeded our expectations.',
    rating: 5,
    avatar: 'DK',
    isVisible: true,
    isFeatured: false,
    category: 'web',
    order: 4,
    createdAt: '2024-01-25',
  },
  {
    id: 'testimonial_5',
    name: 'Lisa Anderson',
    role: 'Photography Director',
    company: 'Fashion Forward',
    content: 'We process thousands of images weekly and ClippingBD handles it flawlessly. The Nitro priority service is a game-changer for our tight deadlines.',
    rating: 5,
    avatar: 'LA',
    isVisible: true,
    isFeatured: false,
    category: 'image',
    order: 5,
    createdAt: '2024-02-05',
  },
  {
    id: 'testimonial_6',
    name: 'Robert Johnson',
    role: 'Digital Marketing Lead',
    company: 'Global Retail Co',
    content: 'The AI-powered background removal has saved us countless hours. Integration with our existing workflow was seamless, and the API documentation is excellent.',
    rating: 5,
    avatar: 'RJ',
    isVisible: true,
    isFeatured: false,
    category: 'ai',
    order: 6,
    createdAt: '2024-03-15',
  },
  {
    id: 'testimonial_7',
    name: 'Jennifer Lee',
    role: 'Brand Manager',
    company: 'Luxe Cosmetics',
    content: 'Exceptional attention to detail on our beauty product retouching. They understand the nuances of cosmetic photography and deliver consistently beautiful results.',
    rating: 5,
    avatar: 'JL',
    isVisible: true,
    isFeatured: true,
    category: 'image',
    order: 7,
    createdAt: '2024-02-28',
  },
  {
    id: 'testimonial_8',
    name: 'Alex Thompson',
    role: 'CTO',
    company: 'TechStartup Inc',
    content: 'The custom AI solution they built for us automated 80% of our image processing. ROI was positive within the first month.',
    rating: 5,
    avatar: 'AT',
    isVisible: true,
    isFeatured: false,
    category: 'ai',
    order: 8,
    createdAt: '2024-03-20',
  },
];

// Get featured testimonials
export function getFeaturedTestimonials(): TestimonialItem[] {
  return testimonialsData
    .filter(t => t.isVisible && t.isFeatured)
    .sort((a, b) => a.order - b.order);
}

// Get testimonials by category
export function getTestimonialsByCategory(category: TestimonialItem['category']): TestimonialItem[] {
  return testimonialsData
    .filter(t => t.isVisible && t.category === category)
    .sort((a, b) => a.order - b.order);
}

// Get all visible testimonials
export function getAllVisibleTestimonials(): TestimonialItem[] {
  return testimonialsData
    .filter(t => t.isVisible)
    .sort((a, b) => a.order - b.order);
}

// Get testimonials by rating
export function getTestimonialsByRating(minRating: number): TestimonialItem[] {
  return testimonialsData
    .filter(t => t.isVisible && t.rating >= minRating)
    .sort((a, b) => a.order - b.order);
}
