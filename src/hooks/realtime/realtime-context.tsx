'use client'

import { createContext, useContext, useEffect, useCallback, useRef, useState, ReactNode } from 'react'
import { useAppStore } from '@/store/app-store'

// Event types for realtime updates
export type RealtimeEventType = 
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_DELETED'
  | 'TASK_CLAIMED'
  | 'TASK_SUBMITTED'
  | 'TASK_APPROVED'
  | 'TASK_REJECTED'
  | 'NEW_NOTIFICATION'
  | 'STATS_UPDATED'
  | 'USER_UPDATED'

export interface RealtimeEvent {
  type: RealtimeEventType
  payload: unknown
  timestamp: Date
}

interface RealtimeContextValue {
  // Subscribe to events
  subscribe: (eventType: RealtimeEventType | '*', callback: (event: RealtimeEvent) => void) => () => void
  // Emit an event (for local updates)
  emit: (event: Omit<RealtimeEvent, 'timestamp'>) => void
  // Connection status
  isConnected: boolean
  // Last event received
  lastEvent: RealtimeEvent | null
  // Force refresh all subscribed components
  refreshAll: () => void
  // Register a refresh callback
  registerRefresh: (id: string, callback: () => void) => () => void
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAppStore()
  const subscribersRef = useRef<Map<string, Set<(event: RealtimeEvent) => void>>>(new Map())
  const refreshCallbacksRef = useRef<Map<string, () => void>>(new Map())
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)

  // Derive connection status from user presence
  const isConnected = Boolean(user)

  // Subscribe to events
  const subscribe = useCallback((eventType: RealtimeEventType | '*', callback: (event: RealtimeEvent) => void) => {
    const key = eventType
    if (!subscribersRef.current.has(key)) {
      subscribersRef.current.set(key, new Set())
    }
    subscribersRef.current.get(key)!.add(callback)

    // Return unsubscribe function
    return () => {
      subscribersRef.current.get(key)?.delete(callback)
      if (subscribersRef.current.get(key)?.size === 0) {
        subscribersRef.current.delete(key)
      }
    }
  }, [])

  // Emit an event
  const emit = useCallback((event: Omit<RealtimeEvent, 'timestamp'>) => {
    const fullEvent: RealtimeEvent = {
      ...event,
      timestamp: new Date(),
    }
    
    setLastEvent(fullEvent)

    // Notify subscribers for this specific event type
    const specificCallbacks = subscribersRef.current.get(event.type)
    if (specificCallbacks) {
      specificCallbacks.forEach(callback => callback(fullEvent))
    }

    // Notify wildcard subscribers
    const wildcardCallbacks = subscribersRef.current.get('*')
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => callback(fullEvent))
    }
  }, [])

  // Refresh all registered callbacks
  const refreshAll = useCallback(() => {
    refreshCallbacksRef.current.forEach(callback => callback())
  }, [])

  // Register a refresh callback
  const registerRefresh = useCallback((id: string, callback: () => void) => {
    refreshCallbacksRef.current.set(id, callback)
    return () => {
      refreshCallbacksRef.current.delete(id)
    }
  }, [])

  const value: RealtimeContextValue = {
    subscribe,
    emit,
    isConnected,
    lastEvent,
    refreshAll,
    registerRefresh,
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

// Convenience hook for subscribing to specific event types
export function useRealtimeEvent(
  eventType: RealtimeEventType | '*',
  callback: (event: RealtimeEvent) => void
) {
  const { subscribe } = useRealtime()

  useEffect(() => {
    return subscribe(eventType, callback)
  }, [eventType, callback, subscribe])
}

// Hook to emit events after successful API calls
export function useRealtimeEmitter() {
  const { emit } = useRealtime()

  const emitOrderCreated = useCallback((order: unknown) => {
    emit({ type: 'ORDER_CREATED', payload: order })
  }, [emit])

  const emitOrderUpdated = useCallback((order: unknown) => {
    emit({ type: 'ORDER_UPDATED', payload: order })
  }, [emit])

  const emitTaskClaimed = useCallback((task: unknown) => {
    emit({ type: 'TASK_CLAIMED', payload: task })
  }, [emit])

  const emitTaskSubmitted = useCallback((task: unknown) => {
    emit({ type: 'TASK_SUBMITTED', payload: task })
  }, [emit])

  const emitTaskApproved = useCallback((task: unknown) => {
    emit({ type: 'TASK_APPROVED', payload: task })
  }, [emit])

  const emitTaskRejected = useCallback((task: unknown) => {
    emit({ type: 'TASK_REJECTED', payload: task })
  }, [emit])

  const emitNewNotification = useCallback((notification: unknown) => {
    emit({ type: 'NEW_NOTIFICATION', payload: notification })
  }, [emit])

  const emitStatsUpdated = useCallback((stats: unknown) => {
    emit({ type: 'STATS_UPDATED', payload: stats })
  }, [emit])

  return {
    emitOrderCreated,
    emitOrderUpdated,
    emitTaskClaimed,
    emitTaskSubmitted,
    emitTaskApproved,
    emitTaskRejected,
    emitNewNotification,
    emitStatsUpdated,
  }
}
