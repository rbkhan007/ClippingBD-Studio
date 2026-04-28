'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch {
    return null;
  }
}

function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
}

const supabaseTableMap: Record<string, string> = {
  'cms_hero': 'cms_hero',
  'cms_statistics': 'cms_statistics',
  'cms_features': 'cms_features',
  'cms_services': 'cms_services',
  'cms_pricing_tiers': 'cms_pricing_tiers',
  'cms_testimonials': 'cms_testimonials',
  'cms_portfolio': 'cms_portfolio_items',
  'cms_team': 'cms_team_members',
  'cms_faqs': 'cms_faqs',
  'cms_partners': 'cms_partners',
  'cms_social_links': 'cms_social_links',
  'cms_contact_info': 'cms_contact_info',
  'cms_global_settings': 'cms_global_settings',
};

const apiEndpoints: Record<string, string> = {
  cms_hero: '/api/cms/hero',
  cms_statistics: '/api/cms/statistics',
  cms_features: '/api/cms/features',
  cms_services: '/api/cms/services',
  cms_pricing_tiers: '/api/cms/pricing-tiers',
  cms_testimonials: '/api/cms/testimonials',
  cms_portfolio_items: '/api/cms/portfolio',
  cms_team_members: '/api/cms/team',
  cms_faqs: '/api/cms/faqs',
  cms_partners: '/api/cms/partners',
  cms_social_links: '/api/cms/social-links',
  cms_contact_info: '/api/cms/contact-info',
  cms_global_settings: '/api/cms/settings',
};

function fetchApiData(endpoint: string): Promise<any[]> {
  return fetch(endpoint)
    .then(res => res.json())
    .then(data => data.success ? data.data : [])
    .catch(() => []);
}

function subscribeToRealtime<T>(
  tableName: string,
  onUpdate: () => void
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase || !tableName) return () => {};

  try {
    const channel = supabase
      .channel(`cms-${tableName}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        () => { onUpdate(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  } catch (e) {
    console.error(`[Realtime] Failed to subscribe to ${tableName}:`, e);
    return () => {};
  }
}

function fetchWithRealtime<T>(
  endpoint: string,
  setData: (data: T) => void
) {
  const tableKey = endpoint.replace('/api/cms/', '').replace('/api/', '');
  const supabaseTable = supabaseTableMap[tableKey];
  
  const fetchData = async () => {
    const data = await fetchApiData(endpoint);
    setData(data as T);
  };
  
  fetchData();

  if (isSupabaseConfigured() && supabaseTable) {
    return subscribeToRealtime(supabaseTable, fetchData);
  }
  return () => {};
}

// Hook with loading and error states
function useCmsHook<T>(endpoint: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(endpoint)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch data');
        }
      })
      .catch(err => {
        setError(err.message || 'Network error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [endpoint]);

  return { data, loading, error };
}

// API content hooks with loading/error states
export function useCmsHero() {
  return useCmsHook<any>(apiEndpoints.cms_hero, null);
}

export function useCmsStatistics() {
  return useCmsHook<any[]>(apiEndpoints.cms_statistics, []);
}

export function useCmsFeatures() {
  return useCmsHook<any[]>(apiEndpoints.cms_features, []);
}

export function useCmsServices() {
  return useCmsHook<any[]>(apiEndpoints.cms_services, []);
}

export function useCmsTestimonials() {
  const [data, setData] = useState<any[]>([]);
  const cleanupRef = useRef<() => void>(null);
  
  useEffect(() => {
    cleanupRef.current = fetchWithRealtime(apiEndpoints.cms_testimonials, (d: any) => setData(d));
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, []);
  return data;
}

export function useCmsTeamMembers() {
  const [data, setData] = useState<any[]>([]);
  const cleanupRef = useRef<() => void>(null);
  
  useEffect(() => {
    cleanupRef.current = fetchWithRealtime(apiEndpoints.cms_team_members, (d: any) => setData(d));
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, []);
  return data;
}

export function useCmsPartners() {
  const [data, setData] = useState<any[]>([]);
  const cleanupRef = useRef<() => void>(null);
  
  useEffect(() => {
    cleanupRef.current = fetchWithRealtime(apiEndpoints.cms_partners, (d: any) => setData(d));
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, []);
  return data;
}

export function useCmsContactInfo() {
  const [data, setData] = useState<any>(null);
  const cleanupRef = useRef<() => void>(null);
  
  useEffect(() => {
    cleanupRef.current = fetchWithRealtime(apiEndpoints.cms_contact_info, (d: any) => setData(d));
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, []);
  return data;
}

export function useCmsSettings() {
  const [data, setData] = useState<any>(null);
  const cleanupRef = useRef<() => void>(null);
  
  useEffect(() => {
    cleanupRef.current = fetchWithRealtime(apiEndpoints.cms_global_settings, (d: any) => setData(d));
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, []);
  return data;
}

// Specific hooks for page content
export function usePageContent(slug: string) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/cms/pages/${slug}`)
      .then(res => res.json())
      .then(result => { if (result.success) setData(result.data); })
      .catch(console.error);
  }, [slug]);
  return data;
}

// Content type interfaces
export interface HeroContent {
  id: string;
  page: string;
  badge: { icon: string; text: string };
  headline: { line1: string; highlight: string; line2: string };
  description: string;
  primaryCTA: { text: string; href: string };
  secondaryCTA: { text: string; href: string; icon: string };
  trustBadges?: string[];
}

export interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  pricing: { starting: string; unit: string };
  stats: { value: string; label: string };
  gradient: string;
  icon: string;
}

// Alias exports for easier use
export const useHeroContent = useCmsHero;
export const useServices = useCmsServices;
export const useStatistics = useCmsStatistics;
export const useFeatures = useCmsFeatures;
export const useTestimonials = useCmsTestimonials;
export const useTeamMembers = useCmsTeamMembers;
export const usePartners = useCmsPartners;
export const useContactInfo = useCmsContactInfo;
export const useGlobalSettings = useCmsSettings;

export type { };