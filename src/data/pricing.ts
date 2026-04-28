// Pricing Data - Easily editable configuration
// Dev account can modify these values through the Admin CMS

export interface VolumeDiscount {
  id: string;
  minQuantity: number;
  maxQuantity: number | null; // null means unlimited
  discountPercent: number;
  label: string;
  order: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limitations: string[];
  isPopular: boolean;
  isEnterprise: boolean;
  maxProjects: number | null; // null means unlimited
  maxUsers: number;
  order: number;
}

export interface CurrencyOption {
  id: string;
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // Relative to USD
}

export const volumeDiscounts: VolumeDiscount[] = [
  {
    id: 'volume_1',
    minQuantity: 1,
    maxQuantity: 50,
    discountPercent: 0,
    label: '1-50 images',
    order: 1,
  },
  {
    id: 'volume_2',
    minQuantity: 51,
    maxQuantity: 100,
    discountPercent: 5,
    label: '51-100 images (5% off)',
    order: 2,
  },
  {
    id: 'volume_3',
    minQuantity: 101,
    maxQuantity: 500,
    discountPercent: 10,
    label: '101-500 images (10% off)',
    order: 3,
  },
  {
    id: 'volume_4',
    minQuantity: 501,
    maxQuantity: 1000,
    discountPercent: 15,
    label: '501-1000 images (15% off)',
    order: 4,
  },
  {
    id: 'volume_5',
    minQuantity: 1001,
    maxQuantity: null,
    discountPercent: 20,
    label: '1001+ images (20% off)',
    order: 5,
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: 'plan_free',
    name: 'Free Trial',
    description: 'Try our services with no commitment',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 free test images',
      'Basic clipping path',
      '48-hour turnaround',
      'Email support',
      'Watermarked previews',
    ],
    limitations: [
      'No priority processing',
      'Limited formats',
      'No API access',
    ],
    isPopular: false,
    isEnterprise: false,
    maxProjects: 1,
    maxUsers: 1,
    order: 1,
  },
  {
    id: 'plan_starter',
    name: 'Starter',
    description: 'Perfect for small businesses',
    monthlyPrice: 49,
    yearlyPrice: 470, // ~20% off
    features: [
      '50 images/month',
      'All service types',
      '24-hour turnaround',
      'Email & chat support',
      'No watermarks',
      'All file formats',
    ],
    limitations: [
      'No API access',
      'No dedicated manager',
    ],
    isPopular: false,
    isEnterprise: false,
    maxProjects: 5,
    maxUsers: 2,
    order: 2,
  },
  {
    id: 'plan_professional',
    name: 'Professional',
    description: 'For growing businesses',
    monthlyPrice: 149,
    yearlyPrice: 1430, // ~20% off
    features: [
      '200 images/month',
      'All service types',
      '12-hour turnaround',
      'Priority support',
      'API access',
      'Dedicated manager',
      'Custom workflows',
      'Nitro priority',
    ],
    limitations: [],
    isPopular: true,
    isEnterprise: false,
    maxProjects: 20,
    maxUsers: 5,
    order: 3,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large teams',
    monthlyPrice: 0, // Contact for pricing
    yearlyPrice: 0,
    features: [
      'Unlimited images',
      'All service types',
      '6-hour turnaround',
      '24/7 dedicated support',
      'Custom API integration',
      'Account manager',
      'Custom workflows',
      'White-label options',
      'On-premise deployment',
      'SLA guarantees',
    ],
    limitations: [],
    isPopular: false,
    isEnterprise: true,
    maxProjects: null,
    maxUsers: 999,
    order: 4,
  },
];

export const currencies: CurrencyOption[] = [
  { id: 'usd', code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1 },
  { id: 'eur', code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.92 },
  { id: 'gbp', code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.79 },
  { id: 'bdt', code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', exchangeRate: 110 },
  { id: 'aud', code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 1.53 },
  { id: 'cad', code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 1.36 },
];

// Calculate price with volume discount
export function calculateVolumeDiscount(quantity: number, basePrice: number): {
  finalPrice: number;
  discountPercent: number;
  discountLabel: string;
} {
  const discount = volumeDiscounts.find(d => 
    quantity >= d.minQuantity && (d.maxQuantity === null || quantity <= d.maxQuantity)
  ) || volumeDiscounts[0];

  const discountAmount = basePrice * (discount.discountPercent / 100);
  return {
    finalPrice: basePrice - discountAmount,
    discountPercent: discount.discountPercent,
    discountLabel: discount.label,
  };
}

// Convert price to different currency
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const from = currencies.find(c => c.code === fromCurrency);
  const to = currencies.find(c => c.code === toCurrency);
  if (!from || !to) return amount;
  
  const usdAmount = amount / from.exchangeRate;
  return usdAmount * to.exchangeRate;
}

// Get popular plan
export function getPopularPlan(): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.isPopular);
}

// Get plan by ID
export function getPlanById(id: string): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.id === id);
}
