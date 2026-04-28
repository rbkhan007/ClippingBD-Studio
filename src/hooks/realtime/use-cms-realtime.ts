'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = typeof window !== 'undefined' 
  ? (window as any).__NEXT_DATA__?.props?.pageProps?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL
  : process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = typeof window !== 'undefined'
  ? (window as any).__NEXT_DATA__?.props?.pageProps?.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('[Realtime] Supabase not configured');
    return null;
  }
  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('[Realtime] Failed to create client:', error);
    return null;
  }
}

function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
}

const supabaseTableMap: Record<string, string> = {
  'hero': 'cms_hero',
  'statistics': 'cms_statistics',
  'features': 'cms_features',
  'services': 'cms_services',
  'pricing-tiers': 'cms_pricing_tiers',
  'testimonials': 'cms_testimonials',
  'portfolio': 'cms_portfolio_items',
  'team': 'cms_team_members',
  'faqs': 'cms_faqs',
  'partners': 'cms_partners',
  'social-links': 'cms_social_links',
  'contact-info': 'cms_contact_info',
  'settings': 'cms_global_settings',
};

const apiEndpoints: Record<string, string> = {
  hero: '/api/cms/hero',
  statistics: '/api/cms/statistics',
  features: '/api/cms/features',
  services: '/api/cms/services',
  'pricing-tiers': '/api/cms/pricing-tiers',
  testimonials: '/api/cms/testimonials',
  portfolio: '/api/cms/portfolio',
  team: '/api/cms/team',
  faqs: '/api/cms/faqs',
  partners: '/api/cms/partners',
  'social-links': '/api/cms/social-links',
  'contact-info': '/api/cms/contact-info',
  settings: '/api/cms/settings',
};

async function fetchApiData(endpoint: string) {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error(`[Realtime] Fetch error for ${endpoint}:`, error);
    return [];
  }
}

function subscribeToTable(
  tableName: string,
  onUpdate: () => void
): () => void {
  const supabase = getSupabaseClient();
  
  if (!supabase || !tableName) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel(`realtime-${tableName}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        () => {
          console.log(`[Realtime] Change detected in ${tableName}, refreshing...`);
          onUpdate();
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscribed to ${tableName}:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error(`[Realtime] Subscribe error for ${tableName}:`, error);
    return () => {};
  }
}

function createUseCmsData(tableKey: string) {
  return function useCmsData() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const channelCleanupRef = useRef<(() => void) | null>(null);
    const endpoint = apiEndpoints[tableKey];
    const supabaseTable = supabaseTableMap[tableKey];

    const fetchData = useCallback(async () => {
      setLoading(true);
      const result = await fetchApiData(endpoint);
      setData(result);
      setLoading(false);
    }, [endpoint]);

    useEffect(() => {
      fetchData();

      if (isSupabaseConfigured() && supabaseTable) {
        channelCleanupRef.current = subscribeToTable(supabaseTable, fetchData);
      }

      return () => {
        if (channelCleanupRef.current) {
          channelCleanupRef.current();
        }
      };
    }, [fetchData, supabaseTable]);

    return { data, loading, error, refetch: fetchData };
  };
}

export const useCmsHero = createUseCmsData('hero');
export const useCmsStatistics = createUseCmsData('statistics');
export const useCmsFeatures = createUseCmsData('features');
export const useCmsServices = createUseCmsData('services');
export const useCmsPricingTiers = createUseCmsData('pricing-tiers');
export const useCmsTestimonials = createUseCmsData('testimonials');
export const useCmsPortfolio = createUseCmsData('portfolio');
export const useCmsTeam = createUseCmsData('team');
export const useCmsFaqs = createUseCmsData('faqs');
export const useCmsPartners = createUseCmsData('partners');
export const useCmsSocialLinks = createUseCmsData('social-links');
export const useCmsContactInfo = createUseCmsData('contact-info');
export const useCmsSettings = createUseCmsData('settings');

export function isRealtimeConfigured() {
  return isSupabaseConfigured();
}