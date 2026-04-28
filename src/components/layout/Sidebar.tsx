'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Home, PlusCircle, Folder, CreditCard,
  Image as ImageIcon, HeadphonesIcon, MessageSquare, LayoutGrid,
  Briefcase, DollarSign, CheckCircle, RefreshCw, BarChart3,
  Users, Package, Layers, Star, FileText, Settings as SettingsIcon, Terminal, Database,
  LogOut
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserRole } from '@/types/database';

interface SidebarProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    avatar: string | null;
    walletBalance: number;
  };
  currentPage: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, PlusCircle, Folder, CreditCard, ImageIcon, HeadphonesIcon, MessageSquare,
  LayoutGrid, Briefcase, DollarSign, CheckCircle, RefreshCw, BarChart3, Users,
  Package, Layers, Star, FileText, SettingsIcon, Terminal, Database
};

export function Sidebar({ user, currentPage, onNavigate, onLogout, sidebarOpen: externalOpen, onToggleSidebar }: SidebarProps) {
  const [internalOpen, setInternalOpen] = useState(true);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const toggle = onToggleSidebar || (() => setInternalOpen(!internalOpen));

  const role = user.role;

  const getNavItems = () => {
    const items: Array<{ path: string; label: string; icon: string }> = [];

    // All authenticated users get these
    if (['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'].includes(role)) {
      items.push(
        { path: '/dashboard', label: 'Dashboard', icon: 'Home' },
        { path: '/brief/new', label: 'New Order', icon: 'PlusCircle' },
        { path: '/projects', label: 'My Projects', icon: 'Folder' },
        { path: '/billing', label: 'Billing', icon: 'CreditCard' },
        { path: '/assets', label: 'My Assets', icon: 'ImageIcon' },
        { path: '/support', label: 'Support', icon: 'HeadphonesIcon' },
        { path: '/messages', label: 'Messages', icon: 'MessageSquare' }
      );
    }

    // Editor features
    if (['EDITOR', 'QA', 'ADMIN', 'DEVELOPER'].includes(role)) {
      items.push(
        { path: '/editor/board', label: 'Job Board', icon: 'LayoutGrid' },
        { path: '/editor/workspace', label: 'Workspace', icon: 'Briefcase' },
        { path: '/editor/payouts', label: 'Earnings', icon: 'DollarSign' }
      );
    }

    // QA features
    if (['QA', 'ADMIN', 'DEVELOPER'].includes(role)) {
      items.push(
        { path: '/qa/pending', label: 'QA Queue', icon: 'CheckCircle' },
        { path: '/qa/revisions', label: 'Revisions', icon: 'RefreshCw' }
      );
    }

    // Admin features
    if (['ADMIN', 'DEVELOPER'].includes(role)) {
      items.push(
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'Home' },
        { path: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
        { path: '/admin/users', label: 'User CRM', icon: 'Users' },
        { path: '/admin/orders', label: 'Orders', icon: 'Package' },
        { path: '/admin/services', label: 'Services', icon: 'Layers' },
        { path: '/admin/reviews', label: 'Reviews', icon: 'Star' },
        { path: '/admin/cms', label: 'CMS', icon: 'FileText' },
        { path: '/admin/settings', label: 'Settings', icon: 'SettingsIcon' }
      );
    }

    // Developer features
    if (role === 'DEVELOPER') {
      items.push(
        { path: '/dev/console', label: 'Dev Console', icon: 'Terminal' },
        { path: '/dev/backup', label: 'Disaster Recovery', icon: 'Database' }
      );
    }

    return items;
  };

  const navItems = getNavItems();
  const IconComponent = (iconName: string) => iconMap[iconName] || Home;

  const handleNav = (path: string) => {
    onNavigate(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 72 }}
      className="fixed left-0 top-16 bottom-0 z-40 glass border-r border-border flex flex-col"
    >
      {/* Toggle Button */}
      <button
        onClick={() => toggle()}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted z-10"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* User Info */}
      <div className={cn("p-4 border-b border-border", !isOpen && "flex justify-center")}>
        <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
          <Avatar className="w-10 h-10 border-2 border-emerald-500/50">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>
        {isOpen && user.walletBalance !== undefined && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
              {role}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              <span>{user.walletBalance.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const isActive = currentPage === item.path || currentPage.startsWith(item.path + '/');
              const Icon = IconComponent(item.icon);

              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => handleNav(item.path)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full",
                        isActive
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        isOpen ? "justify-start" : "justify-center"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive && "text-emerald-400")} />
                      {isOpen && <span>{item.label}</span>}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"
                        />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  {!isOpen && (
                    <TooltipContent side="right">
                      <span>{item.label}</span>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border space-y-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNav('/profile')}
                className={cn("w-full", isOpen ? "justify-start" : "justify-center")}
              >
                <SettingsIcon className="w-4 h-4" />
                {isOpen && <span className="ml-2">Settings</span>}
              </Button>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className={cn("w-full text-red-400 hover:text-red-300 hover:bg-red-500/10", isOpen ? "justify-start" : "justify-center")}
              >
                <LogOut className="w-4 h-4" />
                {isOpen && <span className="ml-2">Logout</span>}
              </Button>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.aside>
  );
}
