// ClippingBD Studio - Supabase Database Types
// Generated types for the complete application

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar: string | null
          role: UserRole
          status: UserStatus
          wallet_balance: number
          stripe_customer_id: string | null
          impersonating: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar?: string | null
          role?: UserRole
          status?: UserStatus
          wallet_balance?: number
          stripe_customer_id?: string | null
          impersonating?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar?: string | null
          role?: UserRole
          status?: UserStatus
          wallet_balance?: number
          stripe_customer_id?: string | null
          impersonating?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          metadata?: Json | null
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: string
          type: SettingType
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          type?: SettingType
          description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          type?: SettingType
          description?: string | null
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          slug: string
          category: ServiceCategory
          description: string
          features: Json
          base_price: number
          turnaround: number
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category: ServiceCategory
          description: string
          features?: Json
          base_price?: number
          turnaround?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: ServiceCategory
          description?: string
          features?: Json
          base_price?: number
          turnaround?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          client_id: string
          service_id: string
          status: OrderStatus
          priority: OrderPriority
          title: string
          description: string | null
          requirements: Json | null
          quantity: number
          base_amount: number
          priority_bonus: number
          total_amount: number
          is_paid: boolean
          deadline: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
          source_files: Json | null
          deliverable_files: Json | null
          service_type: ServiceType
          web_requirements: Json | null
          deployment_url: string | null
        }
        Insert: {
          id?: string
          order_number: string
          client_id: string
          service_id: string
          status?: OrderStatus
          priority?: OrderPriority
          title: string
          description?: string | null
          requirements?: Json | null
          quantity?: number
          base_amount: number
          priority_bonus?: number
          total_amount: number
          is_paid?: boolean
          deadline?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          source_files?: Json | null
          deliverable_files?: Json | null
          service_type?: ServiceType
          web_requirements?: Json | null
          deployment_url?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          client_id?: string
          service_id?: string
          status?: OrderStatus
          priority?: OrderPriority
          title?: string
          description?: string | null
          requirements?: Json | null
          quantity?: number
          base_amount?: number
          priority_bonus?: number
          total_amount?: number
          is_paid?: boolean
          deadline?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          source_files?: Json | null
          deliverable_files?: Json | null
          service_type?: ServiceType
          web_requirements?: Json | null
          deployment_url?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          order_id: string
          editor_id: string | null
          status: TaskStatus
          department: Department
          claimed_at: string | null
          submitted_at: string | null
          deadline: string | null
          payout_amount: number | null
          revision_count: number
          revision_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          editor_id?: string | null
          status?: TaskStatus
          department: Department
          claimed_at?: string | null
          submitted_at?: string | null
          deadline?: string | null
          payout_amount?: number | null
          revision_count?: number
          revision_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          editor_id?: string | null
          status?: TaskStatus
          department?: Department
          claimed_at?: string | null
          submitted_at?: string | null
          deadline?: string | null
          payout_amount?: number | null
          revision_count?: number
          revision_notes?: string | null
          created_at?: string
        }
      }
      qa_reviews: {
        Row: {
          id: string
          task_id: string
          order_id: string
          qa_id: string
          status: QAStatus
          score: number | null
          feedback: string | null
          annotations: Json | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          order_id: string
          qa_id: string
          status?: QAStatus
          score?: number | null
          feedback?: string | null
          annotations?: Json | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          order_id?: string
          qa_id?: string
          status?: QAStatus
          score?: number | null
          feedback?: string | null
          annotations?: Json | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      websites: {
        Row: {
          id: string
          order_id: string
          name: string
          domain: string | null
          status: WebsiteStatus
          framework: string
          repo_url: string | null
          preview_url: string | null
          live_url: string | null
          config: Json | null
          created_at: string
          updated_at: string
          deployed_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          name: string
          domain?: string | null
          status?: WebsiteStatus
          framework?: string
          repo_url?: string | null
          preview_url?: string | null
          live_url?: string | null
          config?: Json | null
          created_at?: string
          updated_at?: string
          deployed_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          name?: string
          domain?: string | null
          status?: WebsiteStatus
          framework?: string
          repo_url?: string | null
          preview_url?: string | null
          live_url?: string | null
          config?: Json | null
          created_at?: string
          updated_at?: string
          deployed_at?: string | null
        }
      }
      deployments: {
        Row: {
          id: string
          website_id: string
          status: DeploymentStatus
          version: string
          logs: string | null
          deployed_at: string | null
          created_at: string
          deployed_by: string | null
        }
        Insert: {
          id?: string
          website_id: string
          status?: DeploymentStatus
          version?: string
          logs?: string | null
          deployed_at?: string | null
          created_at?: string
          deployed_by?: string | null
        }
        Update: {
          id?: string
          website_id?: string
          status?: DeploymentStatus
          version?: string
          logs?: string | null
          deployed_at?: string | null
          created_at?: string
          deployed_by?: string | null
        }
      }
      assets: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          filename: string
          original_name: string
          mime_type: string
          size: number
          bucket: string
          path: string
          url: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          filename: string
          original_name: string
          mime_type: string
          size: number
          bucket: string
          path: string
          url: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          filename?: string
          original_name?: string
          mime_type?: string
          size?: number
          bucket?: string
          path?: string
          url?: string
          is_public?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: TransactionType
          amount: number
          currency: string
          status: TransactionStatus
          payment_method: string | null
          stripe_id: string | null
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: TransactionType
          amount: number
          currency?: string
          status?: TransactionStatus
          payment_method?: string | null
          stripe_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: TransactionType
          amount?: number
          currency?: string
          status?: TransactionStatus
          payment_method?: string | null
          stripe_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      payouts: {
        Row: {
          id: string
          editor_id: string
          amount: number
          status: PayoutStatus
          period_start: string
          period_end: string
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          editor_id: string
          amount: number
          status?: PayoutStatus
          period_start: string
          period_end: string
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          editor_id?: string
          amount?: number
          status?: PayoutStatus
          period_start?: string
          period_end?: string
          processed_at?: string | null
          created_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          client_id: string
          order_id: string | null
          subject: string
          description: string
          status: TicketStatus
          priority: TicketPriority
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          order_id?: string | null
          subject: string
          description: string
          status?: TicketStatus
          priority?: TicketPriority
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          order_id?: string | null
          subject?: string
          description?: string
          status?: TicketStatus
          priority?: TicketPriority
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          message: string
          attachments: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          message: string
          attachments?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string
          message?: string
          attachments?: Json | null
          created_at?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          service_type: string
          before_image: string
          after_image: string
          thumbnail: string | null
          is_published: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string
          service_type?: string
          before_image: string
          after_image: string
          thumbnail?: string | null
          is_published?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          service_type?: string
          before_image?: string
          after_image?: string
          thumbnail?: string | null
          is_published?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          type: ChatRoomType
          name: string | null
          order_id: string | null
          ticket_id: string | null
          participants: string[]
          last_message: string | null
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: ChatRoomType
          name?: string | null
          order_id?: string | null
          ticket_id?: string | null
          participants: string[]
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: ChatRoomType
          name?: string | null
          order_id?: string | null
          ticket_id?: string | null
          participants?: string[]
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          attachments: Json | null
          is_read: boolean
          read_by: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          attachments?: Json | null
          is_read?: boolean
          read_by?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          attachments?: Json | null
          is_read?: boolean
          read_by?: Json | null
          created_at?: string
        }
      }
      partner_sites: {
        Row: {
          id: string
          name: string
          url: string
          logo: string | null
          description: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          logo?: string | null
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          logo?: string | null
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          type: string
          entity_type: string | null
          entity_id: string | null
          data: Json | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          entity_type?: string | null
          entity_id?: string | null
          data?: Json | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          entity_type?: string | null
          entity_id?: string | null
          data?: Json | null
          user_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type exports
export type UserRole = 'GUEST' | 'CLIENT' | 'EDITOR' | 'QA' | 'ADMIN' | 'DEVELOPER'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'
export type SettingType = 'TEXT' | 'JSON' | 'IMAGE' | 'URL'
export type ServiceCategory = 'CLIPPING_PATH' | 'IMAGE' | 'VIDEO' | 'AI' | 'WEB'
export type ServiceType = 'IMAGE' | 'VIDEO' | 'AI' | 'WEB'
export type OrderStatus = 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'QA' | 'REVISION' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED'
export type OrderPriority = 'STANDARD' | 'EXPRESS' | 'NITRO'
export type TaskStatus = 'AVAILABLE' | 'CLAIMED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
export type Department = 'CLIPPING_PATH' | 'RETOUCHING' | 'COLOR_CORRECTION' | 'MOTION_GRAPHICS' | 'AI_PROCESSING' | 'WEB_DEVELOPMENT'
export type QAStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'
export type WebsiteStatus = 'DRAFT' | 'DEVELOPMENT' | 'PREVIEW' | 'LIVE' | 'PAUSED'
export type DeploymentStatus = 'PENDING' | 'BUILDING' | 'SUCCESS' | 'FAILED'
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'ORDER_PAYMENT' | 'REFUND' | 'PAYOUT'
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED'
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
export type NotificationType = 'ORDER_UPDATE' | 'PAYMENT' | 'SYSTEM' | 'DEADLINE' | 'CHAT' | 'QA_FEEDBACK' | 'NITRO_ALERT'
export type ChatRoomType = 'DIRECT' | 'PROJECT' | 'SUPPORT' | 'TEAM'

// Convenience types - Updated to match Prisma schema (camelCase)
export type User = {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: UserRole
  status: UserStatus
  walletBalance: number
  stripeCustomerId: string | null
  impersonating: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}
export type Order = {
  id: string
  orderNumber: string
  clientId: string
  serviceId: string
  status: OrderStatus
  priority: OrderPriority
  title: string
  description: string | null
  requirements: Json | null
  quantity: number
  baseAmount: number
  priorityBonus: number
  totalAmount: number
  isPaid: boolean
  deadline: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  sourceFiles: Json | null
  deliverableFiles: Json | null
  serviceType: ServiceType
  webRequirements: Json | null
  deploymentUrl: string | null
}
export type Task = {
  id: string
  orderId: string
  editorId: string | null
  status: TaskStatus
  department: Department
  claimedAt: string | null
  submittedAt: string | null
  deadline: string | null
  payoutAmount: number | null
  revisionCount: number
  revisionNotes: string | null
  createdAt: string
}
export type Notification = {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}
export type ChatRoom = {
  id: string
  type: ChatRoomType
  name: string | null
  orderId: string | null
  ticketId: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
}
export type ChatMessage = {
  id: string
  roomId: string
  senderId: string
  content: string
  attachments: Json | null
  isRead: boolean
  readBy: Json | null
  createdAt: string
}
export type SystemSetting = {
  id: string
  key: string
  value: string
  type: SettingType
  description: string | null
  updatedAt: string
}
export type Website = {
  id: string
  orderId: string
  name: string
  domain: string | null
  status: WebsiteStatus
  framework: string
  repoUrl: string | null
  previewUrl: string | null
  liveUrl: string | null
  config: Json | null
  createdAt: string
  updatedAt: string
  deployedAt: string | null
}
export type Deployment = {
  id: string
  websiteId: string
  status: DeploymentStatus
  version: string
  logs: string | null
  deployedAt: string | null
  createdAt: string
  deployedBy: string | null
}
export type Asset = {
  id: string
  userId: string
  orderId: string | null
  filename: string
  originalName: string
  mimeType: string
  size: number
  bucket: string
  path: string
  url: string
  isPublic: boolean
  createdAt: string
}
export type Transaction = {
  id: string
  userId: string
  type: TransactionType
  amount: number
  currency: string
  status: TransactionStatus
  paymentMethod: string | null
  stripeId: string | null
  description: string | null
  metadata: Json | null
  createdAt: string
}
export type Payout = {
  id: string
  editorId: string
  amount: number
  status: PayoutStatus
  periodStart: string
  periodEnd: string
  processedAt: string | null
  createdAt: string
}
export type QaReview = {
  id: string
  taskId: string
  orderId: string
  qaId: string
  status: QAStatus
  score: number | null
  feedback: string | null
  annotations: Json | null
  reviewedAt: string | null
  createdAt: string
}
export type PortfolioItem = {
  id: string
  title: string
  description: string | null
  category: string
  serviceType: string
  beforeImage: string
  afterImage: string
  thumbnail: string | null
  isPublished: boolean
  sortOrder: number
  createdAt: string
}
export type Service = {
  id: string
  name: string
  slug: string
  category: string
  description: string
  features: Json
  basePrice: number
  turnaround: number
  isActive: boolean
  sortOrder: number
  createdAt: string
}
export type SupportTicket = {
  id: string
  clientId: string
  orderId: string | null
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}
