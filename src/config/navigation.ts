import type { UserRole } from '@/types/database'
import {
  LayoutDashboard, Briefcase, Folder, DollarSign, MessageSquare,
  HeadphonesIcon, FolderOpen, User, Briefcase as JobBoard,
  Clock, TrendingUp, Globe, Code, Server, Settings, Users,
  Eye, Activity, Shield, Database, Terminal, FileText,
  Package, Star, Layers, BarChart3, RefreshCw, Lock,
  Image as ImageIcon, Video, Sparkles, Award
} from 'lucide-react'

// ============================================
// NAVIGATION ITEM TYPE
// ============================================

export interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  description: string
  badge?: string
  badgeVariant?: 'default' | 'premium' | 'nitro' | 'warning'
}

export interface NavSection {
  title: string
  items: NavItem[]
}

// ============================================
// CLIENT NAVIGATION
// Order & manage projects
// ============================================

export const clientNavigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview & stats',
      },
    ],
  },
  {
    title: 'Orders',
    items: [
      {
        label: 'New Order',
        path: '/brief/new',
        icon: Briefcase,
        description: 'Create new order',
      },
      {
        label: 'Projects',
        path: '/projects',
        icon: Folder,
        description: 'View all projects',
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        label: 'Messages',
        path: '/messages',
        icon: MessageSquare,
        description: 'Chat with team',
      },
      {
        label: 'Support',
        path: '/support',
        icon: HeadphonesIcon,
        description: 'Get help',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        label: 'Billing',
        path: '/billing',
        icon: DollarSign,
        description: 'Wallet & invoices',
      },
      {
        label: 'Assets',
        path: '/assets',
        icon: FolderOpen,
        description: 'File manager',
      },
      {
        label: 'Profile',
        path: '/profile',
        icon: User,
        description: 'Account settings',
      },
    ],
  },
]

// ============================================
// EDITOR NAVIGATION
// Work on tasks & earn
// ============================================

export const editorNavigation: NavSection[] = [
  {
    title: 'Tasks',
    items: [
      {
        label: 'Job Board',
        path: '/editor/jobs',
        icon: JobBoard,
        description: 'Claim tasks',
      },
      {
        label: 'My Workspace',
        path: '/editor/workspace',
        icon: LayoutDashboard,
        description: 'Active tasks',
      },
    ],
  },
  {
    title: 'Earnings',
    items: [
      {
        label: 'Earnings',
        path: '/editor/earnings',
        icon: TrendingUp,
        description: 'Track income',
      },
    ],
  },
  {
    title: 'Web Development',
    items: [
      {
        label: 'Web Workspace',
        path: '/editor/web',
        icon: Code,
        description: 'Code editor',
      },
      {
        label: 'Deployments',
        path: '/editor/deploy',
        icon: Server,
        description: 'Deploy projects',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        label: 'Profile',
        path: '/profile',
        icon: User,
        description: 'Editor profile',
      },
    ],
  },
]

// ============================================
// QA NAVIGATION
// Review & approve work
// ============================================

export const qaNavigation: NavSection[] = [
  {
    title: 'Queue',
    items: [
      {
        label: 'QA Queue',
        path: '/qa/pending',
        icon: Clock,
        description: 'Pending reviews',
        badge: 'New',
        badgeVariant: 'premium',
      },
    ],
  },
  {
    title: 'Review',
    items: [
      {
        label: 'QA Review',
        path: '/qa/review',
        icon: Eye,
        description: 'Full review tool',
      },
      {
        label: 'Web Review',
        path: '/qa/web',
        icon: Globe,
        description: 'Review web projects',
      },
    ],
  },
  {
    title: 'Tracking',
    items: [
      {
        label: 'Revisions',
        path: '/qa/revisions',
        icon: Activity,
        description: 'Revision tracking',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        label: 'Profile',
        path: '/profile',
        icon: User,
        description: 'QA profile',
      },
    ],
  },
]

// ============================================
// ADMIN NAVIGATION
// Full system control
// ============================================

export const adminNavigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
        description: 'Admin overview',
      },
      {
        label: 'Analytics',
        path: '/admin/analytics',
        icon: BarChart3,
        description: 'Global analytics',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'User CRM',
        path: '/admin/users',
        icon: Users,
        description: 'Manage users',
      },
      {
        label: 'Orders',
        path: '/admin/orders',
        icon: Package,
        description: 'All orders',
      },
      {
        label: 'Services',
        path: '/admin/services',
        icon: Layers,
        description: 'Service config',
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        label: 'Reviews',
        path: '/admin/reviews',
        icon: Star,
        description: 'Client reviews',
      },
      {
        label: 'CMS',
        path: '/admin/cms',
        icon: FileText,
        description: 'Content management',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Settings',
        path: '/admin/settings',
        icon: Settings,
        description: 'System settings',
      },
    ],
  },
]

// ============================================
// DEVELOPER NAVIGATION
// System & infrastructure
// ============================================

export const developerNavigation: NavSection[] = [
  {
    title: 'System',
    items: [
      {
        label: 'System Health',
        path: '/dev/health',
        icon: Activity,
        description: 'Infrastructure status',
      },
      {
        label: 'Config Manager',
        path: '/dev/config',
        icon: Settings,
        description: 'Env & flags',
      },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      {
        label: 'Logs',
        path: '/dev/logs',
        icon: FileText,
        description: 'System logs',
      },
    ],
  },
  {
    title: 'Backup',
    items: [
      {
        label: 'Backups',
        path: '/dev/backups',
        icon: Database,
        description: 'Backup management',
      },
    ],
  },
  {
    title: 'Developer Tools',
    items: [
      {
        label: 'API Docs',
        path: '/dev/api-docs',
        icon: Code,
        description: 'API documentation',
      },
      {
        label: 'Impersonate',
        path: '/dev/impersonate',
        icon: Users,
        description: 'Test as any user',
      },
    ],
  },
]

// ============================================
// GET NAVIGATION BY ROLE
// ============================================

export function getNavigationByRole(role: UserRole): NavSection[] {
  switch (role) {
    case 'CLIENT':
      return clientNavigation
    case 'EDITOR':
      return editorNavigation
    case 'QA':
      return qaNavigation
    case 'ADMIN':
      return adminNavigation
    case 'DEVELOPER':
      return developerNavigation
    default:
      return clientNavigation
  }
}

// ============================================
// DASHBOARD PATHS BY ROLE
// ============================================

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'EDITOR':
      return '/editor/workspace'
    case 'QA':
      return '/qa/pending'
    case 'ADMIN':
      return '/admin/dashboard'
    case 'DEVELOPER':
      return '/dev/health'
    default:
      return '/dashboard'
  }
}

// ============================================
// ROLE LABELS & DESCRIPTIONS
// ============================================

export const roleConfig: Record<UserRole, {
  label: string
  description: string
  icon: React.ElementType
  gradient: string
}> = {
  GUEST: {
    label: 'Guest',
    description: 'Public pages only',
    icon: User,
    gradient: 'from-slate-500 to-slate-600',
  },
  CLIENT: {
    label: 'Client',
    description: 'Order & manage projects',
    icon: Package,
    gradient: 'from-blue-500 to-blue-600',
  },
  EDITOR: {
    label: 'Editor',
    description: 'Work on tasks & earn',
    icon: ImageIcon,
    gradient: 'from-purple-500 to-purple-600',
  },
  QA: {
    label: 'QA',
    description: 'Review & approve work',
    icon: Eye,
    gradient: 'from-amber-500 to-amber-600',
  },
  ADMIN: {
    label: 'Admin',
    description: 'Full system control',
    icon: Shield,
    gradient: 'from-emerald-500 to-teal-600',
  },
  DEVELOPER: {
    label: 'Developer',
    description: 'System & infrastructure',
    icon: Terminal,
    gradient: 'from-cyan-500 to-cyan-600',
  },
}

// ============================================
// ALL ROLE OPTIONS (for dropdowns)
// ============================================

export const allRoles: UserRole[] = ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER']

// ============================================
// PROTECTED ROUTES BY ROLE
// ============================================

export const protectedRoutes: Record<UserRole, string[]> = {
  GUEST: [],
  CLIENT: ['/dashboard', '/brief', '/orders', '/projects', '/messages', '/billing', '/support', '/assets', '/profile'],
  EDITOR: ['/editor', '/profile'],
  QA: ['/qa', '/profile'],
  ADMIN: ['/admin', '/users', '/settings', '/cms', '/statistics', '/dashboard'],
  DEVELOPER: ['/dev', '/system', '/logs', '/dashboard'],
}

// ============================================
// CHECK IF ROUTE IS ACCESSIBLE
// ============================================

export function canAccessRoute(role: UserRole, path: string): boolean {
  // Public routes are accessible by everyone
  const publicRoutes = ['/', '/services', '/pricing', '/portfolio', '/contact', '/team', '/privacy', '/terms', '/help', '/auth']
  if (publicRoutes.some(route => path.startsWith(route))) {
    return true
  }

  // Check protected routes
  const accessibleRoutes = protectedRoutes[role] || []
  return accessibleRoutes.some(route => path.startsWith(route))
}
