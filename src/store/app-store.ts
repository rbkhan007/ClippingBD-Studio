import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole, SystemSetting, Notification, ChatRoom } from '@/types/database'
import type { Currency } from '@/data/currency'
import { defaultCurrency } from '@/data/currency'

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  isHydrated: boolean
  
  // Navigation
  currentPage: string
  
  // System
  systemSettings: Record<string, string> | null
  
  // Currency
  selectedCurrency: Currency
  
  // Real-time state
  notifications: Notification[]
  unreadNotifications: number
  chatRooms: ChatRoom[]
  unreadMessages: Record<string, number>
  
  // Actions
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  refreshUser: () => Promise<void>
  logout: () => void
  setCurrentPage: (page: string) => void
  setSystemSettings: (settings: Record<string, string>) => void
  setSelectedCurrency: (currency: Currency) => void
  addNotification: (notification: Notification) => void
  setNotifications: (notifications: Notification[]) => void
  markNotificationRead: (id: string) => void
  setUnreadCount: (count: number) => void
  setChatRooms: (rooms: ChatRoom[]) => void
  setUnreadMessages: (roomId: string, count: number) => void
  setHydrated: (state: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      currentPage: typeof window !== 'undefined' ? window.location.pathname || '/' : '/',
      systemSettings: null,
      selectedCurrency: defaultCurrency,
      notifications: [],
      unreadNotifications: 0,
      chatRooms: [],
      unreadMessages: {},
      
      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
      
      refreshUser: async () => {
        try {
          const response = await fetch('/api/auth/me', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              set({ user: data.user, isAuthenticated: true });
            }
          }
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },
      
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (error) {
          console.error('Logout API error:', error);
        }
        set({ 
          user: null, 
          isAuthenticated: false,
          currentPage: '/',
          notifications: [],
          unreadNotifications: 0,
          chatRooms: [],
          unreadMessages: {},
        });
      },
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setSystemSettings: (settings) => set({ systemSettings: settings }),
      
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1,
      })),
      
      setNotifications: (notifications) => set({
        notifications,
        unreadNotifications: notifications.filter(n => !n.isRead).length,
      }),
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadNotifications: Math.max(0, state.unreadNotifications - 1),
      })),
      
      setUnreadCount: (count) => set({ unreadNotifications: count }),
      
      setChatRooms: (rooms) => set({ chatRooms: rooms }),
      
      setUnreadMessages: (roomId, count) => set((state) => ({
        unreadMessages: { ...state.unreadMessages, [roomId]: count },
      })),
      
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'clippingbd-studio-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedCurrency: state.selectedCurrency,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

// Role hierarchy for access control
const roleHierarchy: Record<UserRole, number> = {
  GUEST: 0,
  CLIENT: 1,
  EDITOR: 2,
  QA: 3,
  ADMIN: 4,
  DEVELOPER: 5,
}

export function canAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  if (requiredRoles.length === 0) return true
  const userLevel = roleHierarchy[userRole]
  return requiredRoles.some(role => roleHierarchy[role] <= userLevel)
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'EDITOR':
      return '/editor/workspace'
    case 'QA':
      return '/qa/pending'
    case 'ADMIN':
      return '/admin/analytics'
    case 'DEVELOPER':
      return '/dev/console'
    default:
      return '/dashboard'
  }
}
