/**
 * Realtime Service
 * Provides real-time subscriptions with automatic fallback to polling
 * Uses Supabase Realtime when available, otherwise falls back to polling
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Notification, ChatMessage } from '@/types/database'

// ==================== Types ====================

export type SubscriptionType = 'notifications' | 'chat' | 'orders' | 'tasks'

export interface SubscriptionOptions {
  userId?: string
  roomId?: string
  orderId?: string
  onInsert?: (payload: unknown) => void
  onUpdate?: (payload: unknown) => void
  onDelete?: (payload: unknown) => void
}

export interface NotificationSubscriptionOptions extends SubscriptionOptions {
  onNewNotification?: (notification: Notification) => void
}

export interface ChatSubscriptionOptions extends SubscriptionOptions {
  onNewMessage?: (message: ChatMessage) => void
  onTypingStart?: (userId: string) => void
  onTypingEnd?: (userId: string) => void
}

export interface PollingConfig {
  interval: number // milliseconds
  enabled: boolean
}

// ==================== Realtime Service Class ====================

/**
 * Realtime Service
 * Manages subscriptions and provides fallback to polling
 */
class RealtimeServiceClass {
  private channels: Map<string, RealtimeChannel> = new Map()
  private pollingIntervals: Map<string, ReturnType<typeof setInterval>> = new Map()
  private isSupabaseAvailable: boolean
  private lastFetchTimestamps: Map<string, string> = new Map()

  constructor() {
    this.isSupabaseAvailable = isSupabaseConfigured()
    this.log(`Initialized with Supabase ${this.isSupabaseAvailable ? 'available' : 'unavailable (polling fallback)'}`)
  }

  private log(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RealtimeService] ${message}`, ...args)
    }
  }

  /**
   * Check if realtime is available
   */
  isRealtimeAvailable(): boolean {
    return this.isSupabaseAvailable
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(
    userId: string,
    callbacks: {
      onNewNotification?: (notification: Notification) => void
      onNotificationUpdate?: (notification: Notification) => void
    },
    pollingConfig?: PollingConfig
  ): () => void {
    const channelName = `notifications:${userId}`

    if (this.isSupabaseAvailable) {
      return this.subscribeToNotificationsRealtime(channelName, userId, callbacks)
    } else {
      return this.subscribeToNotificationsPolling(channelName, userId, callbacks, pollingConfig)
    }
  }

  /**
   * Subscribe to chat room
   */
  subscribeToChat(
    roomId: string,
    callbacks: {
      onNewMessage?: (message: ChatMessage) => void
      onMessageUpdate?: (message: ChatMessage) => void
      onTypingStart?: (userId: string) => void
      onTypingEnd?: (userId: string) => void
    },
    pollingConfig?: PollingConfig
  ): () => void {
    const channelName = `chat:${roomId}`

    if (this.isSupabaseAvailable) {
      return this.subscribeToChatRealtime(channelName, roomId, callbacks)
    } else {
      return this.subscribeToChatPolling(channelName, roomId, callbacks, pollingConfig)
    }
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrder(
    orderId: string,
    callbacks: {
      onOrderUpdate?: (order: unknown) => void
      onTaskUpdate?: (task: unknown) => void
    },
    pollingConfig?: PollingConfig
  ): () => void {
    const channelName = `order:${orderId}`

    if (this.isSupabaseAvailable) {
      return this.subscribeToOrderRealtime(channelName, orderId, callbacks)
    } else {
      return this.subscribeToOrderPolling(channelName, orderId, callbacks, pollingConfig)
    }
  }

  // ==================== Supabase Realtime Methods ====================

  private subscribeToNotificationsRealtime(
    channelName: string,
    userId: string,
    callbacks: {
      onNewNotification?: (notification: Notification) => void
      onNotificationUpdate?: (notification: Notification) => void
    }
  ): () => void {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return () => {}
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          this.log('New notification:', payload)
          if (payload.new && 'id' in payload.new && callbacks.onNewNotification) {
            callbacks.onNewNotification(payload.new as Notification)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          this.log('Notification update:', payload)
          if (payload.new && 'id' in payload.new && callbacks.onNotificationUpdate) {
            callbacks.onNotificationUpdate(payload.new as Notification)
          }
        }
      )
      .subscribe((status) => {
        this.log(`Subscription status for ${channelName}:`, status)
      })

    this.channels.set(channelName, channel)

    return () => {
      this.unsubscribe(channelName)
    }
  }

  private subscribeToChatRealtime(
    channelName: string,
    roomId: string,
    callbacks: {
      onNewMessage?: (message: ChatMessage) => void
      onMessageUpdate?: (message: ChatMessage) => void
      onTypingStart?: (userId: string) => void
      onTypingEnd?: (userId: string) => void
    }
  ): () => void {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return () => {}
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresChangesPayload<ChatMessage>) => {
          this.log('New chat message:', payload)
          if (payload.new && 'id' in payload.new && callbacks.onNewMessage) {
            callbacks.onNewMessage(payload.new as ChatMessage)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresChangesPayload<ChatMessage>) => {
          this.log('Chat message update:', payload)
          if (payload.new && 'id' in payload.new && callbacks.onMessageUpdate) {
            callbacks.onMessageUpdate(payload.new as ChatMessage)
          }
        }
      )
      // Typing indicator via broadcast
      .on('broadcast', { event: 'typing_start' }, (payload) => {
        if (callbacks.onTypingStart && payload.userId) {
          callbacks.onTypingStart(payload.userId as string)
        }
      })
      .on('broadcast', { event: 'typing_end' }, (payload) => {
        if (callbacks.onTypingEnd && payload.userId) {
          callbacks.onTypingEnd(payload.userId as string)
        }
      })
      .subscribe((status) => {
        this.log(`Subscription status for ${channelName}:`, status)
      })

    this.channels.set(channelName, channel)

    return () => {
      this.unsubscribe(channelName)
    }
  }

  private subscribeToOrderRealtime(
    channelName: string,
    orderId: string,
    callbacks: {
      onOrderUpdate?: (order: unknown) => void
      onTaskUpdate?: (task: unknown) => void
    }
  ): () => void {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return () => {}
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          this.log('Order update:', payload)
          if (callbacks.onOrderUpdate) {
            callbacks.onOrderUpdate(payload.new)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          this.log('Task update:', payload)
          if (callbacks.onTaskUpdate) {
            callbacks.onTaskUpdate(payload.new)
          }
        }
      )
      .subscribe((status) => {
        this.log(`Subscription status for ${channelName}:`, status)
      })

    this.channels.set(channelName, channel)

    return () => {
      this.unsubscribe(channelName)
    }
  }

  // ==================== Polling Fallback Methods ====================

  private subscribeToNotificationsPolling(
    channelName: string,
    userId: string,
    callbacks: {
      onNewNotification?: (notification: Notification) => void
      onNotificationUpdate?: (notification: Notification) => void
    },
    pollingConfig?: PollingConfig
  ): () => void {
    const interval = pollingConfig?.interval ?? 10000 // Default 10 seconds
    const enabled = pollingConfig?.enabled ?? true

    if (!enabled) {
      return () => {}
    }

    this.log(`Starting polling for notifications (userId: ${userId}, interval: ${interval}ms)`)

    const poll = async () => {
      try {
        const lastTimestamp = this.lastFetchTimestamps.get(channelName)
        const url = lastTimestamp 
          ? `/api/notifications?since=${lastTimestamp}`
          : '/api/notifications'

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          
          if (data.notifications && data.notifications.length > 0) {
            // Update timestamp
            const latestNotification = data.notifications[0]
            this.lastFetchTimestamps.set(channelName, latestNotification.created_at)

            // Trigger callbacks for new notifications
            data.notifications.forEach((notification: Notification) => {
              if (callbacks.onNewNotification) {
                callbacks.onNewNotification(notification)
              }
            })
          }
        }
      } catch (error) {
        this.log('Polling error:', error)
      }
    }

    // Initial fetch
    poll()

    // Set up interval
    const intervalId = setInterval(poll, interval)
    this.pollingIntervals.set(channelName, intervalId)

    return () => {
      this.stopPolling(channelName)
    }
  }

  private subscribeToChatPolling(
    channelName: string,
    roomId: string,
    callbacks: {
      onNewMessage?: (message: ChatMessage) => void
      onMessageUpdate?: (message: ChatMessage) => void
      onTypingStart?: (userId: string) => void
      onTypingEnd?: (userId: string) => void
    },
    pollingConfig?: PollingConfig
  ): () => void {
    const interval = pollingConfig?.interval ?? 3000 // Default 3 seconds
    const enabled = pollingConfig?.enabled ?? true

    if (!enabled) {
      return () => {}
    }

    this.log(`Starting polling for chat (roomId: ${roomId}, interval: ${interval}ms)`)

    const poll = async () => {
      try {
        const lastTimestamp = this.lastFetchTimestamps.get(channelName)
        const url = lastTimestamp 
          ? `/api/chat/messages?roomId=${roomId}&since=${lastTimestamp}`
          : `/api/chat/messages?roomId=${roomId}`

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          
          if (data.messages && data.messages.length > 0) {
            // Update timestamp
            const latestMessage = data.messages[0]
            this.lastFetchTimestamps.set(channelName, latestMessage.created_at)

            // Trigger callbacks for new messages
            data.messages.forEach((message: ChatMessage) => {
              if (callbacks.onNewMessage) {
                callbacks.onNewMessage(message)
              }
            })
          }
        }
      } catch (error) {
        this.log('Chat polling error:', error)
      }
    }

    // Initial fetch
    poll()

    // Set up interval
    const intervalId = setInterval(poll, interval)
    this.pollingIntervals.set(channelName, intervalId)

    return () => {
      this.stopPolling(channelName)
    }
  }

  private subscribeToOrderPolling(
    channelName: string,
    orderId: string,
    callbacks: {
      onOrderUpdate?: (order: unknown) => void
      onTaskUpdate?: (task: unknown) => void
    },
    pollingConfig?: PollingConfig
  ): () => void {
    const interval = pollingConfig?.interval ?? 15000 // Default 15 seconds
    const enabled = pollingConfig?.enabled ?? true

    if (!enabled) {
      return () => {}
    }

    this.log(`Starting polling for order (orderId: ${orderId}, interval: ${interval}ms)`)

    let lastOrderState: string | null = null
    let lastTasksState: string | null = null

    const poll = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          
          // Check for order changes
          const orderState = JSON.stringify(data.order)
          if (lastOrderState !== null && orderState !== lastOrderState) {
            if (callbacks.onOrderUpdate) {
              callbacks.onOrderUpdate(data.order)
            }
          }
          lastOrderState = orderState

          // Check for task changes
          if (data.tasks) {
            const tasksState = JSON.stringify(data.tasks)
            if (lastTasksState !== null && tasksState !== lastTasksState) {
              data.tasks.forEach((task: unknown) => {
                if (callbacks.onTaskUpdate) {
                  callbacks.onTaskUpdate(task)
                }
              })
            }
            lastTasksState = tasksState
          }
        }
      } catch (error) {
        this.log('Order polling error:', error)
      }
    }

    // Initial fetch
    poll()

    // Set up interval
    const intervalId = setInterval(poll, interval)
    this.pollingIntervals.set(channelName, intervalId)

    return () => {
      this.stopPolling(channelName)
    }
  }

  // ==================== Typing Indicators ====================

  /**
   * Send typing indicator (Supabase only)
   */
  async sendTypingIndicator(roomId: string, userId: string, isTyping: boolean): Promise<void> {
    if (!this.isSupabaseAvailable) {
      return // No typing indicators in polling mode
    }

    const supabase = getSupabaseClient()
    if (!supabase) return

    const channelName = `chat:${roomId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: isTyping ? 'typing_start' : 'typing_end',
        payload: { userId },
      })
    }
  }

  // ==================== Cleanup ====================

  private unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
      this.log(`Unsubscribed from ${channelName}`)
    }
  }

  private stopPolling(channelName: string): void {
    const intervalId = this.pollingIntervals.get(channelName)
    if (intervalId) {
      clearInterval(intervalId)
      this.pollingIntervals.delete(channelName)
      this.lastFetchTimestamps.delete(channelName)
      this.log(`Stopped polling for ${channelName}`)
    }
  }

  /**
   * Unsubscribe from all channels and stop all polling
   */
  unsubscribeAll(): void {
    // Unsubscribe from all Supabase channels
    this.channels.forEach((channel, name) => {
      channel.unsubscribe()
      this.log(`Unsubscribed from ${name}`)
    })
    this.channels.clear()

    // Stop all polling
    this.pollingIntervals.forEach((intervalId, name) => {
      clearInterval(intervalId)
      this.log(`Stopped polling for ${name}`)
    })
    this.pollingIntervals.clear()
    this.lastFetchTimestamps.clear()
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptions(): { realtime: number; polling: number } {
    return {
      realtime: this.channels.size,
      polling: this.pollingIntervals.size,
    }
  }
}

// ==================== Exports ====================

// Singleton instance
let realtimeServiceInstance: RealtimeServiceClass | null = null

/**
 * Get the realtime service singleton
 */
export function getRealtimeService(): RealtimeServiceClass {
  if (!realtimeServiceInstance) {
    realtimeServiceInstance = new RealtimeServiceClass()
  }
  return realtimeServiceInstance
}

/**
 * Reset the realtime service (useful for testing)
 */
export function resetRealtimeService(): void {
  realtimeServiceInstance?.unsubscribeAll()
  realtimeServiceInstance = null
}

// Default export
export const realtimeService = getRealtimeService()

// Export class for custom instances
export { RealtimeServiceClass }
