import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StatisticItem } from '@/data/statistics';
import type { ServiceItem } from '@/data/services';
import type { PricingPlan, VolumeDiscount } from '@/data/pricing';
import type { TestimonialItem } from '@/data/testimonials';
import type { FeatureItem, FAQItem } from '@/data/features';
import type { SiteSetting } from '@/data/settings';

// Import default data
import { statisticsData } from '@/data/statistics';
import { servicesData } from '@/data/services';
import { pricingPlans, volumeDiscounts } from '@/data/pricing';
import { testimonialsData } from '@/data/testimonials';
import { featuresData, faqData } from '@/data/features';
import { siteSettings } from '@/data/settings';

interface CMSDataState {
  // Data
  statistics: StatisticItem[];
  services: ServiceItem[];
  pricingPlans: PricingPlan[];
  volumeDiscounts: VolumeDiscount[];
  testimonials: TestimonialItem[];
  features: FeatureItem[];
  faqs: FAQItem[];
  settings: SiteSetting[];
  
  // Loading state
  isLoading: boolean;
  lastUpdated: string | null;
  
  // Actions - Statistics
  updateStatistic: (id: string, updates: Partial<StatisticItem>) => void;
  addStatistic: (statistic: StatisticItem) => void;
  deleteStatistic: (id: string) => void;
  
  // Actions - Services
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  addService: (service: ServiceItem) => void;
  deleteService: (id: string) => void;
  
  // Actions - Pricing
  updatePricingPlan: (id: string, updates: Partial<PricingPlan>) => void;
  addPricingPlan: (plan: PricingPlan) => void;
  deletePricingPlan: (id: string) => void;
  updateVolumeDiscount: (id: string, updates: Partial<VolumeDiscount>) => void;
  
  // Actions - Testimonials
  updateTestimonial: (id: string, updates: Partial<TestimonialItem>) => void;
  addTestimonial: (testimonial: TestimonialItem) => void;
  deleteTestimonial: (id: string) => void;
  
  // Actions - Features & FAQs
  updateFeature: (id: string, updates: Partial<FeatureItem>) => void;
  addFeature: (feature: FeatureItem) => void;
  deleteFeature: (id: string) => void;
  updateFAQ: (id: string, updates: Partial<FAQItem>) => void;
  addFAQ: (faq: FAQItem) => void;
  deleteFAQ: (id: string) => void;
  
  // Actions - Settings
  updateSetting: (key: string, value: string | number | boolean) => void;
  
  // Actions - General
  refreshData: () => Promise<void>;
  resetToDefaults: () => void;
}

export const useCMSStore = create<CMSDataState>()(
  persist(
    (set, get) => ({
      // Initial data
      statistics: statisticsData,
      services: servicesData,
      pricingPlans: pricingPlans,
      volumeDiscounts: volumeDiscounts,
      testimonials: testimonialsData,
      features: featuresData,
      faqs: faqData,
      settings: siteSettings,
      isLoading: false,
      lastUpdated: null,
      
      // Statistics CRUD
      updateStatistic: (id, updates) => set(state => ({
        statistics: state.statistics.map(s => s.id === id ? { ...s, ...updates } : s),
        lastUpdated: new Date().toISOString(),
      })),
      addStatistic: (statistic) => set(state => ({
        statistics: [...state.statistics, statistic],
        lastUpdated: new Date().toISOString(),
      })),
      deleteStatistic: (id) => set(state => ({
        statistics: state.statistics.filter(s => s.id !== id),
        lastUpdated: new Date().toISOString(),
      })),
      
      // Services CRUD
      updateService: (id, updates) => set(state => ({
        services: state.services.map(s => s.id === id ? { ...s, ...updates } : s),
        lastUpdated: new Date().toISOString(),
      })),
      addService: (service) => set(state => ({
        services: [...state.services, service],
        lastUpdated: new Date().toISOString(),
      })),
      deleteService: (id) => set(state => ({
        services: state.services.filter(s => s.id !== id),
        lastUpdated: new Date().toISOString(),
      })),
      
      // Pricing CRUD
      updatePricingPlan: (id, updates) => set(state => ({
        pricingPlans: state.pricingPlans.map(p => p.id === id ? { ...p, ...updates } : p),
        lastUpdated: new Date().toISOString(),
      })),
      addPricingPlan: (plan) => set(state => ({
        pricingPlans: [...state.pricingPlans, plan],
        lastUpdated: new Date().toISOString(),
      })),
      deletePricingPlan: (id) => set(state => ({
        pricingPlans: state.pricingPlans.filter(p => p.id !== id),
        lastUpdated: new Date().toISOString(),
      })),
      updateVolumeDiscount: (id, updates) => set(state => ({
        volumeDiscounts: state.volumeDiscounts.map(d => d.id === id ? { ...d, ...updates } : d),
        lastUpdated: new Date().toISOString(),
      })),
      
      // Testimonials CRUD
      updateTestimonial: (id, updates) => set(state => ({
        testimonials: state.testimonials.map(t => t.id === id ? { ...t, ...updates } : t),
        lastUpdated: new Date().toISOString(),
      })),
      addTestimonial: (testimonial) => set(state => ({
        testimonials: [...state.testimonials, testimonial],
        lastUpdated: new Date().toISOString(),
      })),
      deleteTestimonial: (id) => set(state => ({
        testimonials: state.testimonials.filter(t => t.id !== id),
        lastUpdated: new Date().toISOString(),
      })),
      
      // Features CRUD
      updateFeature: (id, updates) => set(state => ({
        features: state.features.map(f => f.id === id ? { ...f, ...updates } : f),
        lastUpdated: new Date().toISOString(),
      })),
      addFeature: (feature) => set(state => ({
        features: [...state.features, feature],
        lastUpdated: new Date().toISOString(),
      })),
      deleteFeature: (id) => set(state => ({
        features: state.features.filter(f => f.id !== id),
        lastUpdated: new Date().toISOString(),
      })),
      
      // FAQs CRUD
      updateFAQ: (id, updates) => set(state => ({
        faqs: state.faqs.map(f => f.id === id ? { ...f, ...updates } : f),
        lastUpdated: new Date().toISOString(),
      })),
      addFAQ: (faq) => set(state => ({
        faqs: [...state.faqs, faq],
        lastUpdated: new Date().toISOString(),
      })),
      deleteFAQ: (id) => set(state => ({
        faqs: state.faqs.filter(f => f.id !== id),
        lastUpdated: new Date().toISOString(),
      })),
      
      // Settings
      updateSetting: (key, value) => set(state => ({
        settings: state.settings.map(s => s.key === key ? { ...s, value } : s),
        lastUpdated: new Date().toISOString(),
      })),
      
      // Refresh data from API
      refreshData: async () => {
        set({ isLoading: true });
        try {
          // In production, fetch from API
          // const res = await fetch('/api/admin/data');
          // const data = await res.json();
          // set({ ...data, isLoading: false });
          set({ isLoading: false, lastUpdated: new Date().toISOString() });
        } catch {
          set({ isLoading: false });
        }
      },
      
      // Reset to defaults
      resetToDefaults: () => set({
        statistics: statisticsData,
        services: servicesData,
        pricingPlans: pricingPlans,
        volumeDiscounts: volumeDiscounts,
        testimonials: testimonialsData,
        features: featuresData,
        faqs: faqData,
        settings: siteSettings,
        lastUpdated: new Date().toISOString(),
      }),
    }),
    {
      name: 'clippingbd-cms-storage',
      partialize: (state) => ({
        statistics: state.statistics,
        services: state.services,
        pricingPlans: state.pricingPlans,
        volumeDiscounts: state.volumeDiscounts,
        testimonials: state.testimonials,
        features: state.features,
        faqs: state.faqs,
        settings: state.settings,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Export helper functions
export function getStatistics() {
  return useCMSStore.getState().statistics.filter(s => s.isVisible);
}

export function getServices() {
  return useCMSStore.getState().services.filter(s => s.isVisible);
}

export function getSetting(key: string): string | number | boolean | undefined {
  const setting = useCMSStore.getState().settings.find(s => s.key === key);
  return setting?.value;
}

export function getPricingPlans() {
  return useCMSStore.getState().pricingPlans;
}

export function getTestimonials() {
  return useCMSStore.getState().testimonials.filter(t => t.isVisible);
}

export function getFeatures() {
  return useCMSStore.getState().features.filter(f => f.isVisible);
}

export function getFAQs() {
  return useCMSStore.getState().faqs.filter(f => f.isVisible);
}
