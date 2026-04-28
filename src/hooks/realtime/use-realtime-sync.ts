'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppStore } from '@/store/app-store'

interface RealtimeOptions<T> {
  url: string
  params?: Record<string, string | number>
  enabled?: boolean
  pollInterval?: number // in milliseconds, default 30000 (30 seconds)
  onUpdate?: (data: T) => void
  deduplicationKey?: keyof T
}

interface RealtimeState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  isPolling: boolean
}

/**
 * A hook for real-time data synchronization with polling.
 * Automatically fetches data at specified intervals and notifies components of changes.
 */
export function useRealtimeSync<T>({
  url,
  params,
  enabled = true,
  pollInterval = 30000,
  onUpdate,
  deduplicationKey,
}: RealtimeOptions<T>) {
  const [state, setState] = useState<RealtimeState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isPolling: false,
  })

  const { user } = useAppStore()
  const previousDataRef = useRef<T | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (isInitial = false) => {
    if (!enabled || !user) return

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      if (isInitial) {
        setState(prev => ({ ...prev, loading: true, error: null }))
      }

      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, String(value))
        })
      }

      const queryString = searchParams.toString()
      const fullUrl = queryString ? `${url}?${queryString}` : url

      const response = await fetch(fullUrl, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        if (response.status === 401) {
          setState(prev => ({ ...prev, error: 'Authentication required', loading: false }))
          return
        }
        const errorData = await response.json().catch(() => ({}))
        setState(prev => ({ ...prev, error: errorData.error || 'Failed to fetch data', loading: false }))
        return
      }

      const result = await response.json()
      
      // Check for data changes using deduplication
      let hasChanges = true
      if (deduplicationKey && previousDataRef.current) {
        const previousKey = JSON.stringify(
          Array.isArray(previousDataRef.current) 
            ? (previousDataRef.current as T[]).map((item: T) => item[deduplicationKey])
            : (previousDataRef.current as Record<string, unknown>)[deduplicationKey as string]
        )
        const currentKey = JSON.stringify(
          Array.isArray(result)
            ? result.map((item: T) => item[deduplicationKey])
            : result[deduplicationKey as string]
        )
        hasChanges = previousKey !== currentKey
      }

      previousDataRef.current = result
      
      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        isPolling: !isInitial,
      })

      // Call onUpdate callback if data has changed
      if (hasChanges && onUpdate) {
        onUpdate(result)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, ignore
        return
      }
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred',
        loading: false,
      }))
    }
  }, [url, params, enabled, user, deduplicationKey, onUpdate])

  // Initial fetch
  useEffect(() => {
    if (enabled && user) {
      fetchData(true)
    }
  }, [enabled, user, fetchData])

  // Polling
  useEffect(() => {
    if (!enabled || !user || pollInterval <= 0) return

    const intervalId = setInterval(() => {
      fetchData(false)
    }, pollInterval)

    return () => clearInterval(intervalId)
  }, [enabled, user, pollInterval, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  return {
    ...state,
    refetch,
  }
}

/**
 * A hook for subscribing to specific entity changes (orders, tasks, etc.)
 * Uses efficient polling with deduplication to minimize unnecessary updates.
 */
export function useEntitySync<T extends { id: string }>(
  entity: 'orders' | 'tasks' | 'users' | 'notifications' | 'transactions',
  options: Omit<RealtimeOptions<{ items: T[]; total: number }>, 'url' | 'deduplicationKey'> = {}
) {
  return useRealtimeSync<{ items: T[]; total: number }>({
    url: `/api/${entity}`,
    deduplicationKey: 'id' as 'items' | 'total' | undefined,
    ...options,
  })
}

/**
 * A hook for subscribing to statistics changes
 */
export function useStatsSync(
  scope: 'user' | 'global' = 'user',
  options: Omit<RealtimeOptions<{ stats: Record<string, unknown> }>, 'url' | 'params'> = {}
) {
  return useRealtimeSync<{ stats: Record<string, unknown> }>({
    url: '/api/statistics',
    params: { scope },
    pollInterval: 60000, // Stats don't need to update as frequently
    ...options,
  })
}

export default useRealtimeSync
