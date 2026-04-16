'use client';

import { useEffect, useState, useCallback } from 'react';
import { isRealtimeEnabled, getSupabaseClient } from '@/lib/supabase/client';

// API endpoints mapping
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

function fetchWithRealtime<T>(endpoint: string, setData: (data: T) => void) {
  const fetchData = () => {
    fetch(endpoint)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setData(result.data);
        }
      })
      .catch(console.error);
  };

  fetchData();

  // Subscribe to Supabase realtime changes if configured
  if (isRealtimeEnabled()) {
    const tableName = endpoint.replace('/api/cms/', '').replace('/api/', '');
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
      'cms_social-links': 'cms_social_links',
      'cms_contact-info': 'cms_contact_info',
      'cms_settings': 'cms_global_settings',
    };

    const table = supabaseTableMap[tableName];
    const supabase = getSupabaseClient();
    if (table && supabase) {
      const channel = supabase
        .channel(`cms-${tableName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }

  return () => {};
}

export function useCmsHero() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_hero)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsStatistics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_statistics)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsFeatures() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_features)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsServices() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_services)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsPricingTiers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_pricing_tiers)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsTestimonials() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_testimonials)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsPortfolio() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_portfolio_items)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsTeam() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_team_members)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsFaqs(category?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_faqs)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const filtered = category 
            ? result.data.filter((f: any) => f.category === category)
            : result.data;
          setData(filtered);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsSettings() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_global_settings)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsContactInfo() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_contact_info)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsSocialLinks() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_social_links)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}

export function useCmsPartners() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoints.cms_partners)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error: null, refetch: () => {} };
}
