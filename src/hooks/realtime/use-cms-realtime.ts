'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

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
    const { createBrowserClient } = require('@supabase/ssr');
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('[Realtime] Failed to create client:', error);
    return null;
  }
}

function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
}

interface CmsData {
  hero: any[];
  statistics: any[];
  features: any[];
  services: any[];
  testimonials: any[];
}

type CmsKeys = keyof CmsData;

function subscribeToTable(
  tableName: string,
  onUpdate: () => void
): () => void {
  const supabase = getSupabaseClient();
  
  if (!supabase || !tableName) {
    return () => {};
  }

  try {
    const channel = supabase.channel(`realtime-${tableName}`)
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
      );

    channel.subscribe((status) => {
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

function useCmsData() {
  const [data, setData] = useState<CmsData>({
    hero: [],
    statistics: [],
    features: [],
    services: [],
    testimonials: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelCleanupRef = useRef<(() => void) | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/hero', { 
        cache: 'force-cache',
        next: { revalidate: 60 }
      });
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (err) {
      console.error('[CMS] Fetch error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (isSupabaseConfigured()) {
      channelCleanupRef.current = subscribeToTable('cms_hero', fetchData);
    }

    return () => {
      if (channelCleanupRef.current) {
        channelCleanupRef.current();
      }
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useCmsHero() {
  const { data, loading, error, refetch } = useCmsData();
  return { data: data.hero, loading, error, refetch };
}

export function useCmsStatistics() {
  const { data, loading, error, refetch } = useCmsData();
  return { data: data.statistics, loading, error, refetch };
}

export function useCmsFeatures() {
  const { data, loading, error, refetch } = useCmsData();
  return { data: data.features, loading, error, refetch };
}

export function useCmsServices() {
  const { data, loading, error, refetch } = useCmsData();
  return { data: data.services, loading, error, refetch };
}

export function useCmsTestimonials() {
  const { data, loading, error, refetch } = useCmsData();
  return { data: data.testimonials, loading, error, refetch };
}

export function useCmsPricingTiers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/cms/pricing-tiers', { next: { revalidate: 60 } });
        const result = await res.json();
        if (result.success) setData(result.data || []);
      } catch (err) {
        console.error('[CMS] Pricing fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, []);

  return { data, loading, error };
}

export function useCmsPortfolio() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch('/api/cms/portfolio', { next: { revalidate: 60 } });
        const result = await res.json();
        if (result.success) setData(result.data || []);
      } catch (err) {
        console.error('[CMS] Portfolio fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  return { data, loading };
}

export function useCmsTeam() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch('/api/cms/team', { next: { revalidate: 60 } });
        const result = await res.json();
        if (result.success) setData(result.data || []);
      } catch (err) {
        console.error('[CMS] Team fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  return { data, loading };
}

export function useCmsFaqs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch('/api/cms/faqs', { next: { revalidate: 60 } });
        const result = await res.json();
        if (result.success) setData(result.data || []);
      } catch (err) {
        console.error('[CMS] FAQs fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  return { data, loading };
}

export function useCmsPartners() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch('/api/cms/partners', { next: { revalidate: 60 } });
        const result = await res.json();
        if (result.success) setData(result.data || []);
      } catch (err) {
        console.error('[CMS] Partners fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  return { data, loading };
}

export function useCmsSocialLinks() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSocialLinks() {
      try {
        const res = await fetch('/api/cms/social-links', { next: { revalidate: 60 } });
        const result = await res.json();
        if (result.success) setData(result.data || []);
      } catch (err) {
        console.error('[CMS] Social links fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSocialLinks();
  }, []);

  return { data, loading };
}

export function useCmsContactInfo() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const res = await fetch('/api/cms/contact-info', { next: { revalidate: 60 } });
        const result = await res.json();
        if (result.success) setData(result.data || []);
      } catch (err) {
        console.error('[CMS] Contact info fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchContactInfo();
  }, []);

  return { data, loading };
}

export function useCmsSettings() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/cms/settings', { next: { revalidate: 60 } });
        const result = await res.json();
        if (result.success) setData(result.data || []);
      } catch (err) {
        console.error('[CMS] Settings fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  return { data, loading };
}

export function isRealtimeConfigured() {
  return isSupabaseConfigured();
}