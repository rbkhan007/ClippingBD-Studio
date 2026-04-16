'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Home, Image, Video, Bot, Globe,
  PlusCircle, Folder, CreditCard, HeadphonesIcon, LayoutGrid,
  Briefcase, Upload, DollarSign, CheckCircle, RefreshCw, BarChart3,
  Users, Settings, Terminal, Database, LogOut, Eye, FileText, MessageSquare, Star, Layers, Package
} from 'lucide-react'
import { useAppStore, canAccess } from '@/store/app-store'
import type { User, UserRole } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Image, Video, Bot, Globe, FileText, PlusCircle, CreditCard,
  HeadphonesIcon, LayoutGrid, Briefcase, Upload, DollarSign, CheckCircle,
  RefreshCw, BarChart3, Users, Settings, Terminal, Database, Folder, MessageSquare, Star, Layers, Package
}

interface SidebarProps {
  user: User
  currentPage: string
  onNavigate: (path: string) => void
  onLogout: () => void
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
}

export function Sidebar({ user, currentPage, onNavigate, onLogout, sidebarOpen: externalOpen, onToggleSidebar }: SidebarProps) {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  // Use external state if provided, otherwise use internal state
  const sidebarOpen = externalOpen !== undefined ? externalOpen : internalSidebarOpen
  const setSidebarOpen = onToggleSidebar || (() => setInternalSidebarOpen(!internalSidebarOpen))

  // Get navigation items based on role
  const getNavItems = () => {
    const items: { path: string; label: string; icon: string }[] = []

    // Client navigation
    if (user.role === 'CLIENT' || user.role === 'ADMIN' || user.role === 'DEVELOPER') {
      items.push(
        { path: '/dashboard', label: 'Dashboard', icon: 'Home' },
        { path: '/brief/new', label: 'New Order', icon: 'PlusCircle' },
        { path: '/projects', label: 'Projects', icon: 'Folder' },
        { path: '/billing', label: 'Billing', icon: 'CreditCard' },
        { path: '/assets', label: 'Assets', icon: 'Image' },
        { path: '/support', label: 'Support', icon: 'HeadphonesIcon' },
        { path: '/messages', label: 'Messages', icon: 'MessageSquare' },
      )
    }

    // Editor navigation
    if (user.role === 'EDITOR' || user.role === 'ADMIN' || user.role === 'DEVELOPER') {
      items.push(
        { path: '/editor/board', label: 'Job Board', icon: 'LayoutGrid' },
        { path: '/editor/workspace', label: 'Workspace', icon: 'Briefcase' },
        { path: '/editor/payouts', label: 'Earnings', icon: 'DollarSign' },
      )
    }

    // QA navigation
    if (user.role === 'QA' || user.role === 'ADMIN' || user.role === 'DEVELOPER') {
      items.push(
        { path: '/qa/pending', label: 'QA Queue', icon: 'CheckCircle' },
        { path: '/qa/revisions', label: 'Revisions', icon: 'RefreshCw' },
      )
    }

    // Admin navigation
    if (user.role === 'ADMIN' || user.role === 'DEVELOPER') {
      items.push(
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'Home' },
        { path: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
        { path: '/admin/users', label: 'User CRM', icon: 'Users' },
        { path: '/admin/orders', label: 'Orders', icon: 'Package' },
        { path: '/admin/services', label: 'Services', icon: 'Layers' },
        { path: '/admin/reviews', label: 'Reviews', icon: 'Star' },
        { path: '/admin/cms', label: 'CMS', icon: 'FileText' },
        { path: '/admin/settings', label: 'Settings', icon: 'Settings' },
      )
    }

    // Developer navigation
    if (user.role === 'DEVELOPER') {
      items.push(
        { path: '/dev/console', label: 'Dev Console', icon: 'Terminal' },
        { path: '/dev/backup', label: 'Disaster Recovery', icon: 'Database' },
      )
    }

    return items
  }

  const navItems = getNavItems()
  const IconComponent = (iconName: string) => iconMap[iconName] || Home

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 72 }}
      className="fixed left-0 top-16 bottom-0 z-40 glass border-r border-white/5 flex flex-col"
    >
      {/* Toggle */}
      <button
        onClick={() => setSidebarOpen()}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* User Info */}
      <div className={cn("p-4 border-b border-white/5", !sidebarOpen && "flex justify-center")}>
        <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
          <Avatar className="w-10 h-10 border-2 border-emerald-500/50">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>
        {sidebarOpen && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
              {user.role}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              {user.walletBalance?.toFixed(2) || '0.00'}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4 custom-scrollbar">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.path || currentPage.startsWith(item.path + '/')
            const Icon = IconComponent(item.icon)
            
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative w-full",
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  !sidebarOpen && "justify-center"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-emerald-400")} />
                
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {!sidebarOpen && hoveredItem === item.path && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover rounded text-sm whitespace-nowrap z-50 text-popover-foreground">
                    {item.label}
                  </div>
                )}
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('/profile')}
          className={cn("w-full", !sidebarOpen && "justify-center")}
        >
          <Settings className="w-4 h-4" />
          {sidebarOpen && <span className="ml-2">Settings</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className={cn("w-full text-red-400 hover:text-red-300 hover:bg-red-500/10", !sidebarOpen && "justify-center")}
        >
          <LogOut className="w-4 h-4" />
          {sidebarOpen && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </motion.aside>
  )
}
