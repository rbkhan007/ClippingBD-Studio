/**
 * Unified Data Service
 * Provides a unified interface for database operations with automatic routing
 * between Supabase and Prisma based on configuration
 */

import { db } from './db'
import { createClient, createAdminClient, isSupabaseConfigured } from './supabase/server'
import { Prisma } from '@prisma/client'
import type { 
  User, 
  Order, 
  Task, 
  Notification, 
  ChatRoom, 
  ChatMessage,
  Service,
  Transaction,
  Payout,
  QaReview,
  PortfolioItem,
  SupportTicket,
  SystemSetting
} from '@/types/database'

export type DataSource = 'supabase' | 'prisma' | 'mock';

export interface QueryResult<T> {
  data: T | null
  error: string | null
  source: DataSource
}

export interface QueryListResult<T> {
  data: T[]
  error: string | null
  source: DataSource
  count?: number
}

// ==================== Data Service Class ====================

export interface DataServiceConfig {
  preferredSource: 'supabase' | 'prisma' | 'auto'
  preferSupabase: boolean
  supabaseUrl?: string
  supabaseAnonKey?: string
  enableLogging: boolean
  mockDelay?: number
}

/**
 * Unified Data Service
 * Routes operations to Supabase or Prisma based on configuration
 */
class DataServiceClass {
  private config: DataServiceConfig

  constructor(config: Partial<DataServiceConfig> = {}) {
    this.config = {
      preferredSource: config.preferredSource ?? 'auto',
      preferSupabase: config.preferSupabase ?? true,
      enableLogging: config.enableLogging ?? process.env.NODE_ENV === 'development',
    }
  }

  private log(message: string, ...args: unknown[]) {
    if (this.config.enableLogging) {
      console.log(`[DataService] ${message}`, ...args)
    }
  }

  private getDataSource(): DataSource {
    return isSupabaseConfigured() && this.config.preferSupabase ? 'supabase' : 'prisma'
  }

  // ==================== Users ====================

  users = {
    findById: async (id: string): Promise<QueryResult<User>> => {
      const source = this.getDataSource()
      this.log('Finding user by ID:', { id, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', id)
              .single()

            if (error) throw error
            return { data: data as User, error: null, source }
          }
        }

        // Prisma fallback
        const user = await db.user.findUnique({ where: { id } })
        return { 
          data: user ? this.mapPrismaUserToDb(user) : null, 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding user:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    findByEmail: async (email: string): Promise<QueryResult<User>> => {
      const source = this.getDataSource()
      this.log('Finding user by email:', { email, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('email', email)
              .single()

            if (error && error.code !== 'PGRST116') throw error
            return { data: data ? data as User : null, error: null, source }
          }
        }

        // Prisma fallback
        const user = await db.user.findUnique({ where: { email } })
        return { 
          data: user ? this.mapPrismaUserToDb(user) : null, 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding user by email:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    create: async (userData: Prisma.UserCreateInput): Promise<QueryResult<User>> => {
      const source = this.getDataSource()
      this.log('Creating user:', { source })

      try {
        if (source === 'supabase') {
          const supabase = await createAdminClient()
          if (supabase) {
            const userRecord = {
              email: userData.email,
              password: userData.password,
              name: userData.name,
              avatar: userData.avatar,
              role: userData.role || 'CLIENT',
              status: userData.status || 'ACTIVE',
            }
            const { data, error } = await supabase
              .from('users')
              .insert(userRecord as unknown as never)
              .select()
              .single()

            if (error) throw error
            return { data: data as User, error: null, source }
          }
        }

        // Prisma fallback
        const user = await db.user.create({ data: userData })
        return { 
          data: this.mapPrismaUserToDb(user), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error creating user:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    update: async (id: string, userData: Prisma.UserUpdateInput): Promise<QueryResult<User>> => {
      const source = this.getDataSource()
      this.log('Updating user:', { id, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('users')
              .update(userData as unknown as never)
              .eq('id', id)
              .select()
              .single()

            if (error) throw error
            return { data: data as User, error: null, source }
          }
        }

        // Prisma fallback
        const user = await db.user.update({ 
          where: { id }, 
          data: userData 
        })
        return { 
          data: this.mapPrismaUserToDb(user), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error updating user:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    list: async (options?: {
      role?: string
      status?: string
      limit?: number
      offset?: number
    }): Promise<QueryListResult<User>> => {
      const source = this.getDataSource()
      this.log('Listing users:', { options, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            let query = supabase.from('users').select('*', { count: 'exact' })
            
            if (options?.role) query = query.eq('role', options.role)
            if (options?.status) query = query.eq('status', options.status)
            if (options?.limit) query = query.limit(options.limit)
            if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1)

            const { data, error, count } = await query

            if (error) throw error
            return { data: data as User[], error: null, source, count: count || 0 }
          }
        }

        // Prisma fallback
        const where: Prisma.UserWhereInput = {}
        if (options?.role) where.role = options.role
        if (options?.status) where.status = options.status

        const [users, count] = await Promise.all([
          db.user.findMany({
            where,
            take: options?.limit,
            skip: options?.offset,
          }),
          db.user.count({ where }),
        ])

        return { 
          data: users.map(this.mapPrismaUserToDb), 
          error: null, 
          source: 'prisma',
          count 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error listing users:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },
  }

  // ==================== Orders ====================

  orders = {
    findById: async (id: string): Promise<QueryResult<Order>> => {
      const source = this.getDataSource()
      this.log('Finding order by ID:', { id, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('orders')
              .select('*, service:services(*), client:users(*)')
              .eq('id', id)
              .single()

            if (error) throw error
            return { data: data as Order, error: null, source }
          }
        }

        // Prisma fallback
        const order = await db.order.findUnique({ 
          where: { id },
          include: { service: true, client: true }
        })
        return { 
          data: order ? this.mapPrismaOrderToDb(order) : null, 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding order:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    findByClientId: async (clientId: string, options?: {
      status?: string
      limit?: number
      offset?: number
    }): Promise<QueryListResult<Order>> => {
      const source = this.getDataSource()
      this.log('Finding orders by client:', { clientId, options, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            let query = supabase
              .from('orders')
              .select('*', { count: 'exact' })
              .eq('client_id', clientId)
            
            if (options?.status) query = query.eq('status', options.status)
            if (options?.limit) query = query.limit(options.limit)
            if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1)

            const { data, error, count } = await query

            if (error) throw error
            return { data: data as Order[], error: null, source, count: count || 0 }
          }
        }

        // Prisma fallback
        const where: Prisma.OrderWhereInput = { clientId }
        if (options?.status) where.status = options.status

        const [orders, count] = await Promise.all([
          db.order.findMany({
            where,
            take: options?.limit,
            skip: options?.offset,
            include: { service: true },
            orderBy: { createdAt: 'desc' },
          }),
          db.order.count({ where }),
        ])

        return { 
          data: orders.map(this.mapPrismaOrderToDb), 
          error: null, 
          source: 'prisma',
          count 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding orders by client:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },

    create: async (orderData: Prisma.OrderCreateInput): Promise<QueryResult<Order>> => {
      const source = this.getDataSource()
      this.log('Creating order:', { source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('orders')
              .insert(orderData as unknown as never)
              .select()
              .single()

            if (error) throw error
            return { data: data as Order, error: null, source }
          }
        }

        // Prisma fallback
        const order = await db.order.create({ data: orderData })
        return { 
          data: this.mapPrismaOrderToDb(order), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error creating order:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    update: async (id: string, orderData: Prisma.OrderUpdateInput): Promise<QueryResult<Order>> => {
      const source = this.getDataSource()
      this.log('Updating order:', { id, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('orders')
              .update(orderData as unknown as never)
              .eq('id', id)
              .select()
              .single()

            if (error) throw error
            return { data: data as Order, error: null, source }
          }
        }

        // Prisma fallback
        const order = await db.order.update({ 
          where: { id }, 
          data: orderData 
        })
        return { 
          data: this.mapPrismaOrderToDb(order), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error updating order:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    list: async (options?: {
      status?: string
      priority?: string
      limit?: number
      offset?: number
    }): Promise<QueryListResult<Order>> => {
      const source = this.getDataSource()
      this.log('Listing orders:', { options, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            let query = supabase.from('orders').select('*', { count: 'exact' })
            
            if (options?.status) query = query.eq('status', options.status)
            if (options?.priority) query = query.eq('priority', options.priority)
            if (options?.limit) query = query.limit(options.limit)
            if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1)

            const { data, error, count } = await query

            if (error) throw error
            return { data: data as Order[], error: null, source, count: count || 0 }
          }
        }

        // Prisma fallback
        const where: Prisma.OrderWhereInput = {}
        if (options?.status) where.status = options.status
        if (options?.priority) where.priority = options.priority

        const [orders, count] = await Promise.all([
          db.order.findMany({
            where,
            take: options?.limit,
            skip: options?.offset,
            include: { service: true, client: true },
            orderBy: { createdAt: 'desc' },
          }),
          db.order.count({ where }),
        ])

        return { 
          data: orders.map(this.mapPrismaOrderToDb), 
          error: null, 
          source: 'prisma',
          count 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error listing orders:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },
  }

  // ==================== Notifications ====================

  notifications = {
    findByUserId: async (userId: string, options?: {
      unreadOnly?: boolean
      limit?: number
      offset?: number
    }): Promise<QueryListResult<Notification>> => {
      const source = this.getDataSource()
      this.log('Finding notifications for user:', { userId, options, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            let query = supabase
              .from('notifications')
              .select('*', { count: 'exact' })
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
            
            if (options?.unreadOnly) query = query.eq('is_read', false as unknown as never)
            if (options?.limit) query = query.limit(options.limit)
            if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1)

            const { data, error, count } = await query

            if (error) throw error
            return { data: data as Notification[], error: null, source, count: count || 0 }
          }
        }

        // Prisma fallback
        const where: Prisma.NotificationWhereInput = { userId }
        if (options?.unreadOnly) where.isRead = false

        const [notifications, count] = await Promise.all([
          db.notification.findMany({
            where,
            take: options?.limit,
            skip: options?.offset,
            orderBy: { createdAt: 'desc' },
          }),
          db.notification.count({ where }),
        ])

        return { 
          data: notifications.map(this.mapPrismaNotificationToDb), 
          error: null, 
          source: 'prisma',
          count 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding notifications:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },

    create: async (notificationData: Prisma.NotificationCreateInput): Promise<QueryResult<Notification>> => {
      const source = this.getDataSource()
      this.log('Creating notification:', { source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('notifications')
              .insert(notificationData as unknown as never)
              .select()
              .single()

            if (error) throw error
            return { data: data as Notification, error: null, source }
          }
        }

        // Prisma fallback
        const notification = await db.notification.create({ data: notificationData })
        return { 
          data: this.mapPrismaNotificationToDb(notification), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error creating notification:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    markAsRead: async (id: string): Promise<QueryResult<Notification>> => {
      const source = this.getDataSource()
      this.log('Marking notification as read:', { id, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('notifications')
              .update({ is_read: true } as unknown as never)
              .eq('id', id)
              .select()
              .single()

            if (error) throw error
            return { data: data as Notification, error: null, source }
          }
        }

        // Prisma fallback
        const notification = await db.notification.update({ 
          where: { id }, 
          data: { isRead: true } 
        })
        return { 
          data: this.mapPrismaNotificationToDb(notification), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error marking notification as read:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    markAllAsRead: async (userId: string): Promise<{ count: number; error: string | null }> => {
      const source = this.getDataSource()
      this.log('Marking all notifications as read for user:', { userId, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('notifications')
              .update({ is_read: true } as unknown as never)
              .eq('user_id', userId)
              .eq('is_read', false as unknown as never)
              .select('id')

            if (error) throw error
            return { count: data?.length || 0, error: null }
          }
        }

        // Prisma fallback
        const result = await db.notification.updateMany({ 
          where: { userId, isRead: false }, 
          data: { isRead: true } 
        })
        return { count: result.count, error: null }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error marking all notifications as read:', errorMsg)
        return { count: 0, error: errorMsg }
      }
    },
  }

  // ==================== Services ====================

  services = {
    list: async (options?: {
      category?: string
      activeOnly?: boolean
    }): Promise<QueryListResult<Service>> => {
      const source = this.getDataSource()
      this.log('Listing services:', { options, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            let query = supabase.from('services').select('*')
            
            if (options?.category) query = query.eq('category', options.category)
            if (options?.activeOnly) query = query.eq('is_active', true)
            query = query.order('sort_order', { ascending: true })

            const { data, error } = await query

            if (error) throw error
            return { data: data as Service[], error: null, source }
          }
        }

        // Prisma fallback
        const where: Prisma.ServiceWhereInput = {}
        if (options?.category) where.category = options.category
        if (options?.activeOnly) where.isActive = true

        const services = await db.service.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
        })

        return { 
          data: services.map(this.mapPrismaServiceToDb), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error listing services:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },

    findBySlug: async (slug: string): Promise<QueryResult<Service>> => {
      const source = this.getDataSource()
      this.log('Finding service by slug:', { slug, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('services')
              .select('*')
              .eq('slug', slug)
              .single()

            if (error) throw error
            return { data: data as Service, error: null, source }
          }
        }

        // Prisma fallback
        const service = await db.service.findUnique({ where: { slug } })
        return { 
          data: service ? this.mapPrismaServiceToDb(service) : null, 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding service:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },
  }

  // ==================== System Settings ====================

  settings = {
    get: async (key: string): Promise<QueryResult<SystemSetting>> => {
      const source = this.getDataSource()
      this.log('Getting setting:', { key, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('system_settings')
              .select('*')
              .eq('key', key)
              .single()

            if (error && error.code !== 'PGRST116') throw error
            return { data: data ? data as SystemSetting : null, error: null, source }
          }
        }

        // Prisma fallback
        const setting = await db.systemSetting.findUnique({ where: { key } })
        return { 
          data: setting ? this.mapPrismaSettingToDb(setting) : null, 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error getting setting:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    set: async (key: string, value: string, type?: string): Promise<QueryResult<SystemSetting>> => {
      const source = this.getDataSource()
      this.log('Setting value:', { key, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('system_settings')
              .upsert({ key, value, type: type || 'TEXT' } as unknown as never)
              .select()
              .single()

            if (error) throw error
            return { data: data as SystemSetting, error: null, source }
          }
        }

        // Prisma fallback
        const setting = await db.systemSetting.upsert({
          where: { key },
          create: { key, value, type: type || 'TEXT' },
          update: { value, type: type || 'TEXT' },
        })
        return { 
          data: this.mapPrismaSettingToDb(setting), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error setting value:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    list: async (): Promise<QueryListResult<SystemSetting>> => {
      const source = this.getDataSource()
      this.log('Listing all settings:', { source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('system_settings')
              .select('*')

            if (error) throw error
            return { data: data as SystemSetting[], error: null, source }
          }
        }

        // Prisma fallback
        const settings = await db.systemSetting.findMany()
        return { 
          data: settings.map(this.mapPrismaSettingToDb), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error listing settings:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },
  }

  // ==================== Analytics ====================

  analytics = {
    track: async (event: {
      type: string
      entityType?: string
      entityId?: string
      userId?: string
      data?: Record<string, unknown>
    }): Promise<QueryResult<unknown>> => {
      const source = this.getDataSource()
      this.log('Tracking analytics event:', { type: event.type, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('analytics_events')
              .insert({
                type: event.type,
                entity_type: event.entityType,
                entity_id: event.entityId,
                user_id: event.userId,
                data: event.data,
              } as unknown as never)
              .select()
              .single()

            if (error) throw error
            return { data: data as unknown, error: null, source }
          }
        }

        // Prisma fallback
        const analyticsEvent = await db.analyticsEvent.create({
          data: {
            type: event.type,
            entityType: event.entityType,
            entityId: event.entityId,
            userId: event.userId,
            data: event.data ? JSON.stringify(event.data) : null,
          },
        })
        return { 
          data: this.mapPrismaAnalyticsEventToDb(analyticsEvent) as unknown, 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error tracking analytics event:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },
  }

  // ==================== Tasks ====================

  tasks = {
    findById: async (id: string): Promise<QueryResult<Task>> => {
      const source = this.getDataSource()
      this.log('Finding task by ID:', { id, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('tasks')
              .select('*, order:orders(*), editor:users(*)')
              .eq('id', id)
              .single()

            if (error) throw error
            return { data: data as Task, error: null, source }
          }
        }

        // Prisma fallback
        const task = await db.task.findUnique({
          where: { id },
          include: { order: true, editor: true },
        })
        return { 
          data: task ? this.mapPrismaTaskToDb(task) : null, 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding task:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    findByOrderId: async (orderId: string): Promise<QueryListResult<Task>> => {
      const source = this.getDataSource()
      this.log('Finding tasks for order:', { orderId, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('tasks')
              .select('*')
              .eq('order_id', orderId)

            if (error) throw error
            return { data: data as Task[], error: null, source }
          }
        }

        // Prisma fallback
        const tasks = await db.task.findMany({
          where: { orderId },
          include: { editor: true },
        })

        return { 
          data: tasks.map(this.mapPrismaTaskToDb), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding tasks:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },

    update: async (id: string, taskData: Prisma.TaskUpdateInput): Promise<QueryResult<Task>> => {
      const source = this.getDataSource()
      this.log('Updating task:', { id, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('tasks')
              .update(taskData as unknown as never)
              .eq('id', id)
              .select()
              .single()

            if (error) throw error
            return { data: data as Task, error: null, source }
          }
        }

        // Prisma fallback
        const task = await db.task.update({ where: { id }, data: taskData })
        return { 
          data: this.mapPrismaTaskToDb(task), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error updating task:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },
  }

  // ==================== Transactions ====================

  transactions = {
    create: async (transactionData: Prisma.TransactionCreateInput): Promise<QueryResult<Transaction>> => {
      const source = this.getDataSource()
      this.log('Creating transaction:', { source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('transactions')
              .insert(transactionData as unknown as never)
              .select()
              .single()

            if (error) throw error
            return { data: data as Transaction, error: null, source }
          }
        }

        // Prisma fallback
        const transaction = await db.transaction.create({ data: transactionData })
        return { 
          data: this.mapPrismaTransactionToDb(transaction), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error creating transaction:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    findByUserId: async (userId: string, options?: {
      type?: string
      limit?: number
      offset?: number
    }): Promise<QueryListResult<Transaction>> => {
      const source = this.getDataSource()
      this.log('Finding transactions for user:', { userId, options, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            let query = supabase
              .from('transactions')
              .select('*', { count: 'exact' })
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
            
            if (options?.type) query = query.eq('type', options.type)
            if (options?.limit) query = query.limit(options.limit)
            if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1)

            const { data, error, count } = await query

            if (error) throw error
            return { data: data as Transaction[], error: null, source, count: count || 0 }
          }
        }

        // Prisma fallback
        const where: Prisma.TransactionWhereInput = { userId }
        if (options?.type) where.type = options.type

        const [transactions, count] = await Promise.all([
          db.transaction.findMany({
            where,
            take: options?.limit,
            skip: options?.offset,
            orderBy: { createdAt: 'desc' },
          }),
          db.transaction.count({ where }),
        ])

        return { 
          data: transactions.map(this.mapPrismaTransactionToDb), 
          error: null, 
          source: 'prisma',
          count 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding transactions:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },
  }

  // ==================== Portfolio ====================

  portfolio = {
    list: async (options?: {
      category?: string
      publishedOnly?: boolean
    }): Promise<QueryListResult<PortfolioItem>> => {
      const source = this.getDataSource()
      this.log('Listing portfolio items:', { options, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            let query = supabase.from('portfolio_items').select('*')
            
            if (options?.category) query = query.eq('category', options.category)
            if (options?.publishedOnly) query = query.eq('is_published', true)
            query = query.order('sort_order', { ascending: true })

            const { data, error } = await query

            if (error) throw error
            return { data: data as PortfolioItem[], error: null, source }
          }
        }

        // Prisma fallback
        const where: Prisma.PortfolioItemWhereInput = {}
        if (options?.category) where.category = options.category
        if (options?.publishedOnly) where.isPublished = true

        const items = await db.portfolioItem.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
        })

        return { 
          data: items.map(this.mapPrismaPortfolioItemToDb), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error listing portfolio items:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },
  }

  // ==================== Support Tickets ====================

  tickets = {
    findById: async (id: string): Promise<QueryResult<SupportTicket>> => {
      const source = this.getDataSource()
      this.log('Finding ticket by ID:', { id, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('support_tickets')
              .select('*, client:users(*), messages:ticket_messages(*)')
              .eq('id', id)
              .single()

            if (error) throw error
            return { data: data as SupportTicket, error: null, source }
          }
        }

        // Prisma fallback
        const ticket = await db.supportTicket.findUnique({
          where: { id },
          include: { client: true, messages: true },
        })
        return { 
          data: ticket ? this.mapPrismaTicketToDb(ticket) : null, 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error finding ticket:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },

    create: async (ticketData: Prisma.SupportTicketCreateInput): Promise<QueryResult<SupportTicket>> => {
      const source = this.getDataSource()
      this.log('Creating support ticket:', { source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            const { data, error } = await supabase
              .from('support_tickets')
              .insert(ticketData as unknown as never)
              .select()
              .single()

            if (error) throw error
            return { data: data as SupportTicket, error: null, source }
          }
        }

        // Prisma fallback
        const ticket = await db.supportTicket.create({ data: ticketData })
        return { 
          data: this.mapPrismaTicketToDb(ticket), 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error creating ticket:', errorMsg)
        return { data: null, error: errorMsg, source }
      }
    },
  }

  // ==================== Partner Sites ====================

  partners = {
    list: async (activeOnly?: boolean): Promise<QueryListResult<unknown>> => {
      const source = this.getDataSource()
      this.log('Listing partner sites:', { activeOnly, source })

      try {
        if (source === 'supabase') {
          const supabase = await createClient()
          if (supabase) {
            let query = supabase.from('partner_sites').select('*')
            
            if (activeOnly) query = query.eq('is_active', true)
            query = query.order('sort_order', { ascending: true })

            const { data, error } = await query

            if (error) throw error
            return { data: data as unknown[], error: null, source }
          }
        }

        // Prisma fallback
        const where: Prisma.PartnerSiteWhereInput = {}
        if (activeOnly) where.isActive = true

        const partners = await db.partnerSite.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
        })

        return { 
          data: partners as unknown[], 
          error: null, 
          source: 'prisma' 
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.log('Error listing partner sites:', errorMsg)
        return { data: [], error: errorMsg, source }
      }
    },
  }

  // ==================== Raw Access ====================

  /**
   * Get raw Prisma client for operations not covered by the data service
   */
  get prisma() {
    return db
  }

  /**
   * Check which data source is being used
   */
  getDataSourceInfo() {
    return {
      source: this.getDataSource(),
      isSupabaseConfigured: isSupabaseConfigured(),
    }
  }

  // ==================== Mappers ====================

  private mapPrismaUserToDb(user: Prisma.UserGetPayload<object>): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role as User['role'],
      status: user.status as User['status'],
      walletBalance: user.walletBalance,
      stripeCustomerId: null,
      impersonating: user.impersonating,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
    }
  }

  private mapPrismaOrderToDb(order: Prisma.OrderGetPayload<object>): Order {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      clientId: order.clientId,
      serviceId: order.serviceId,
      status: order.status as Order['status'],
      priority: order.priority as Order['priority'],
      title: order.title,
      description: order.description,
      requirements: order.requirements ? JSON.parse(order.requirements) : null,
      quantity: order.quantity,
      baseAmount: order.baseAmount,
      priorityBonus: order.priorityBonus,
      totalAmount: order.totalAmount,
      isPaid: order.isPaid,
      deadline: order.deadline?.toISOString() || null,
      completedAt: order.completedAt?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      sourceFiles: order.sourceFiles ? JSON.parse(order.sourceFiles) : null,
      deliverableFiles: order.deliverableFiles ? JSON.parse(order.deliverableFiles) : null,
      serviceType: 'IMAGE',
      webRequirements: null,
      deploymentUrl: null,
    }
  }

  private mapPrismaTaskToDb(task: Prisma.TaskGetPayload<object>): Task {
    return {
      id: task.id,
      orderId: task.orderId,
      editorId: task.editorId,
      status: task.status as Task['status'],
      department: task.department as Task['department'],
      claimedAt: task.claimedAt?.toISOString() || null,
      submittedAt: task.submittedAt?.toISOString() || null,
      deadline: task.deadline?.toISOString() || null,
      payoutAmount: task.payoutAmount,
      revisionCount: task.revisionCount,
      revisionNotes: task.revisionNotes,
      createdAt: task.createdAt.toISOString(),
    }
  }

  private mapPrismaNotificationToDb(notification: Prisma.NotificationGetPayload<object>): Notification {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type as Notification['type'],
      title: notification.title,
      message: notification.message,
      link: notification.link,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    }
  }

  private mapPrismaServiceToDb(service: Prisma.ServiceGetPayload<object>): Service {
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      category: service.category as Service['category'],
      description: service.description,
      features: service.features ? JSON.parse(service.features) : [],
      basePrice: service.basePrice,
      turnaround: service.turnaround,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      createdAt: new Date().toISOString(),
    }
  }

  private mapPrismaSettingToDb(setting: Prisma.SystemSettingGetPayload<object>): SystemSetting {
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      type: setting.type as SystemSetting['type'],
      description: setting.description,
      updatedAt: setting.updatedAt.toISOString(),
    }
  }

  private mapPrismaTransactionToDb(transaction: Prisma.TransactionGetPayload<object>): Transaction {
    return {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type as Transaction['type'],
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status as Transaction['status'],
      paymentMethod: transaction.paymentMethod,
      stripeId: transaction.stripeId,
      description: transaction.description,
      metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null,
      createdAt: transaction.createdAt.toISOString(),
    }
  }

  private mapPrismaPortfolioItemToDb(item: Prisma.PortfolioItemGetPayload<object>): PortfolioItem {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      serviceType: item.serviceType,
      beforeImage: item.beforeImage,
      afterImage: item.afterImage,
      thumbnail: item.thumbnail,
      isPublished: item.isPublished,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt.toISOString(),
    }
  }

  private mapPrismaTicketToDb(ticket: Prisma.SupportTicketGetPayload<object>): SupportTicket {
    return {
      id: ticket.id,
      clientId: ticket.clientId,
      orderId: ticket.orderId,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status as SupportTicket['status'],
      priority: ticket.priority as SupportTicket['priority'],
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString() || null,
    }
  }

  private mapPrismaAnalyticsEventToDb(event: Prisma.AnalyticsEventGetPayload<object>): unknown {
    return {
      id: event.id,
      type: event.type,
      entityType: event.entityType,
      entityId: event.entityId,
      data: event.data ? JSON.parse(event.data) : null,
      userId: event.userId,
      createdAt: event.createdAt.toISOString(),
    }
  }

  private mapPrismaPartnerSiteToDb(site: Prisma.PartnerSiteGetPayload<object>): unknown {
    return {
      id: site.id,
      name: site.name,
      url: site.url,
      logo: site.logo,
      description: site.description,
      is_active: site.isActive,
      sort_order: site.sortOrder,
      created_at: new Date().toISOString(),
    }
  }
}

// ==================== Exports ====================

// Singleton instance
let dataServiceInstance: DataServiceClass | null = null

/**
 * Get the data service singleton
 */
export function getDataService(config?: Partial<DataServiceConfig>): DataServiceClass {
  if (!dataServiceInstance) {
    dataServiceInstance = new DataServiceClass(config)
  }
  return dataServiceInstance
}

/**
 * Reset the data service (useful for testing)
 */
export function resetDataService(): void {
  dataServiceInstance = null
}

// Default export
export const dataService = getDataService()

// Export class for custom instances
export { DataServiceClass }

// Export types
export type {
  User,
  Order,
  Task,
  Notification,
  ChatRoom,
  ChatMessage,
  Service,
  Transaction,
  Payout,
  QaReview,
  PortfolioItem,
  SupportTicket,
  SystemSetting,
}
