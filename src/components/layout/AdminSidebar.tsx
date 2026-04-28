'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  Briefcase,
  Star,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Shield,
  Bell,
  Database,
  Palette,
  Lock,
  Monitor,
  ChevronDown,
  CreditCard,
  MessageSquare,
  FileBarChart,
  Activity,
  Zap,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { RealtimeStatus } from '@/hooks/useRealtimeAdmin';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
];

const crmNavItems: NavItem[] = [
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { id: 'orders', label: 'Orders', icon: Package, path: '/admin/orders' },
  { id: 'reviews', label: 'Reviews', icon: Star, path: '/admin/reviews' },
];

const cmsNavItems: NavItem[] = [
  { id: 'pages', label: 'Pages', icon: FileText, path: '/admin/cms/pages' },
  { id: 'blog', label: 'Blog Posts', icon: FileBarChart, path: '/admin/cms/blog' },
  { id: 'services', label: 'Services', icon: Briefcase, path: '/admin/services' },
  { id: 'faq', label: 'FAQs', icon: Layers, path: '/admin/cms/faq' },
];

const settingsNavItems: NavItem[] = [
  { id: 'general', label: 'General', icon: Settings, path: '/admin/settings' },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('main');
  const { user, currentPage, setCurrentPage } = useAppStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleNavigation = (path: string) => {
    setCurrentPage(path);
  };

  const isActive = (path: string) => {
    return currentPage === path || currentPage.startsWith(path + '/');
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const active = isActive(item.path);
    
    const content = (
      <button
        onClick={() => handleNavigation(item.path)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400',
          active && 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium',
          collapsed && 'justify-center px-2'
        )}
      >
        <item.icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-emerald-500')} />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-sm">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-emerald-500/30 text-emerald-400 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-emerald-500/30 text-emerald-400 rounded-full">
                  {item.badge}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card/80 dark:bg-slate-900/80 border-r border-border backdrop-blur-sm z-40 flex flex-col"
    >
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-sm">Admin Panel</span>
            <RealtimeStatus />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn('h-8 w-8 hover:bg-muted', collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation - Scrollable */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-4 custom-scrollbar"
      >
        <div className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Main
              </p>
            )}
            {mainNavItems.map((item) => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          </div>

          <Separator className="mx-2" />

          {/* CRM Section */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                CRM
              </p>
            )}
            {crmNavItems.map((item) => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          </div>

          <Separator className="mx-2" />

          {/* CMS Section */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                CMS & Content
              </p>
            )}
            {cmsNavItems.map((item) => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          </div>

          <Separator className="mx-2" />

          {/* Settings - Single Option */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Settings
              </p>
            )}
            {settingsNavItems.slice(0, 1).map((item) => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Fixed */}
      <div className="flex-shrink-0 p-3 border-t border-border space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={() => handleNavigation('/')}
                className={cn(
                  'w-full justify-start gap-3 text-muted-foreground hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Home className="w-5 h-5" />
                {!collapsed && <span className="text-sm">Back to Home</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <span>Back to Home</span>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                {user.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
