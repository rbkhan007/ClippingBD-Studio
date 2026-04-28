import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  url: string;
  params?: Record<string, string | number>;
  enabled?: boolean;
  initialData?: T;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>({ url, params, enabled = true, initialData }: UseApiOptions<T>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, String(value));
        });
      }

      const queryString = searchParams.toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      const response = await fetch(fullUrl, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to fetch data');
        return;
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, params, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// API mutation helper
export async function apiPost<T>(url: string, body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Request failed' };
    }

    return { data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function apiPut<T>(url: string, body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Request failed' };
    }

    return { data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function apiDelete<T>(url: string): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Request failed' };
    }

    return { data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}
