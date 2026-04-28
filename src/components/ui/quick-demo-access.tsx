'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, Play, X, ChevronRight, Check, Zap,
  LayoutDashboard, Briefcase, Eye, Settings, Terminal,
  Package, DollarSign, Clock, Star, Award, Activity,
  Globe, FileCode, Database, Server, Lock, Unlock,
  User, Layers, Palette, Video, Sparkles, Code, LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore, getDashboardPath } from '@/store/app-store';
import type { UserRole } from '@/types/database';

// Demo user data for each role
const demoUsers: Record<UserRole, {
  name: string;
  email: string;
  avatar: string;
  wallet_balance: number;
}> = {
  GUEST: { name: 'Guest User', email: 'guest@demo.com', avatar: '', wallet_balance: 0 },
  CLIENT: { name: 'John Smith', email: 'john@example.com', avatar: '', wallet_balance: 450.00 },
  EDITOR: { name: 'Sarah Connor', email: 'sarah@clippingbd.com', avatar: '', wallet_balance: 1247.50 },
  QA: { name: 'Mike Wilson', email: 'mike@clippingbd.com', avatar: '', wallet_balance: 0 },
  ADMIN: { name: 'Admin User', email: 'admin@clippingbd.com', avatar: '', wallet_balance: 0 },
  DEVELOPER: { name: 'Dev Master', email: 'dev@clippingbd.com', avatar: '', wallet_balance: 0 },
};

// Role configurations with features
const roleConfig: Record<UserRole, {
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  features: { name: string; icon: LucideIcon; path: string; description: string }[];
}> = {
  GUEST: {
    label: 'Guest',
    description: 'Public pages only',
    icon: User,
    gradient: 'from-slate-500 to-slate-600',
    features: [
      { name: 'Home', icon: Globe, path: '/', description: 'Landing page' },
      { name: 'Services', icon: Layers, path: '/services', description: 'View services' },
      { name: 'Pricing', icon: DollarSign, path: '/pricing', description: 'View pricing' },
      { name: 'Portfolio', icon: Package, path: '/portfolio', description: 'View portfolio' },
      { name: 'Contact', icon: Globe, path: '/contact', description: 'Contact form' },
    ],
  },
  CLIENT: {
    label: 'Client',
    description: 'Order & manage projects',
    icon: Package,
    gradient: 'from-blue-500 to-blue-600',
    features: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', description: 'Overview & stats' },
      { name: 'New Order', icon: Package, path: '/brief/new', description: 'Create new order' },
      { name: 'Projects', icon: Briefcase, path: '/projects', description: 'View all projects' },
      { name: 'Messages', icon: Globe, path: '/messages', description: 'Chat with team' },
      { name: 'Billing', icon: DollarSign, path: '/billing', description: 'Wallet & invoices' },
      { name: 'Support', icon: Shield, path: '/support', description: 'Get help' },
      { name: 'Assets', icon: Package, path: '/assets', description: 'File manager' },
      { name: 'Profile', icon: User, path: '/profile', description: 'Account settings' },
    ],
  },
  EDITOR: {
    label: 'Editor',
    description: 'Work on tasks & earn',
    icon: Palette,
    gradient: 'from-purple-500 to-purple-600',
    features: [
      { name: 'Job Board', icon: Briefcase, path: '/editor/jobs', description: 'Claim tasks' },
      { name: 'My Workspace', icon: LayoutDashboard, path: '/editor/workspace', description: 'Active tasks' },
      { name: 'Earnings', icon: DollarSign, path: '/editor/earnings', description: 'Track income' },
      { name: 'Web Workspace', icon: Code, path: '/editor/web', description: 'Code editor' },
      { name: 'Deployments', icon: Server, path: '/editor/deploy', description: 'Deploy projects' },
      { name: 'Profile', icon: User, path: '/profile', description: 'Editor profile' },
    ],
  },
  QA: {
    label: 'QA',
    description: 'Review & approve work',
    icon: Eye,
    gradient: 'from-amber-500 to-amber-600',
    features: [
      { name: 'QA Queue', icon: Clock, path: '/qa/pending', description: 'Pending reviews' },
      { name: 'QA Review', icon: Eye, path: '/qa/review', description: 'Full review tool' },
      { name: 'Web Review', icon: Globe, path: '/qa/web', description: 'Review web projects' },
      { name: 'Revisions', icon: Activity, path: '/qa/revisions', description: 'Revision tracking' },
      { name: 'Profile', icon: User, path: '/profile', description: 'QA profile' },
    ],
  },
  ADMIN: {
    label: 'Admin',
    description: 'Full system control',
    icon: Shield,
    gradient: 'from-emerald-500 to-teal-600',
    features: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', description: 'Admin overview' },
      { name: 'Analytics', icon: Activity, path: '/admin/analytics', description: 'Global analytics' },
      { name: 'User CRM', icon: Users, path: '/admin/users', description: 'Manage users' },
      { name: 'Orders', icon: Package, path: '/admin/orders', description: 'All orders' },
      { name: 'Services', icon: Layers, path: '/admin/services', description: 'Service config' },
      { name: 'Reviews', icon: Star, path: '/admin/reviews', description: 'Client reviews' },
      { name: 'CMS', icon: FileCode, path: '/admin/cms', description: 'Content management' },
      { name: 'Settings', icon: Settings, path: '/admin/settings', description: 'System settings' },
    ],
  },
  DEVELOPER: {
    label: 'Developer',
    description: 'System & infrastructure',
    icon: Terminal,
    gradient: 'from-cyan-500 to-cyan-600',
    features: [
      { name: 'System Health', icon: Server, path: '/dev/health', description: 'Infrastructure status' },
      { name: 'Config Manager', icon: Settings, path: '/dev/config', description: 'Env & flags' },
      { name: 'Logs', icon: FileCode, path: '/dev/logs', description: 'System logs' },
      { name: 'Backups', icon: Database, path: '/dev/backups', description: 'Backup management' },
      { name: 'API Docs', icon: Code, path: '/dev/api-docs', description: 'API documentation' },
      { name: 'Impersonate', icon: Users, path: '/dev/impersonate', description: 'Test as any user' },
    ],
  },
};

export function QuickDemoAccess() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { user, setUser, setCurrentPage, isAuthenticated } = useAppStore();

  const handleDemoLogin = (role: UserRole) => {
    const demoUser = demoUsers[role];
    setUser({
      id: `demo-${role.toLowerCase()}`,
      email: demoUser.email,
      name: demoUser.name,
      avatar: demoUser.avatar,
      role: role,
      status: 'ACTIVE',
      walletBalance: demoUser.wallet_balance,
      stripeCustomerId: null,
      impersonating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    });
    setSelectedRole(role);
    
    // Navigate to appropriate dashboard
    const dashboardPath = getDashboardPath(role);
    setCurrentPage(dashboardPath);
    window.history.pushState({}, '', dashboardPath);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedRole(null);
    setCurrentPage('/');
    window.history.pushState({}, '', '/');
  };

  return (
    <>
      {/* Floating Demo Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className={`w-14 h-14 rounded-full shadow-xl ${
            isAuthenticated 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
              : 'bg-gradient-to-r from-purple-500 to-pink-600'
          } hover:scale-110 transition-transform`}
        >
          <Zap className="w-6 h-6" />
        </Button>
        {!isOpen && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Demo Access Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass-card border-emerald-500/30">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Quick Demo Access</CardTitle>
                        <CardDescription>
                          Test all features by switching between user roles
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Tabs defaultValue="roles" className="w-full">
                    <div className="border-b border-border px-6 pt-4">
                      <TabsList className="bg-muted/30 dark:bg-white/5">
                        <TabsTrigger value="roles" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                          <Users className="w-4 h-4 mr-2" />
                          User Roles
                        </TabsTrigger>
                        <TabsTrigger value="current" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                          <Shield className="w-4 h-4 mr-2" />
                          Current Session
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="roles" className="m-0">
                      <ScrollArea className="h-[60vh] custom-scrollbar">
                        <div className="p-6 space-y-4 pb-6">
                          {Object.entries(roleConfig).map(([role, config]) => {
                            const isActive = user?.role === role;
                            const Icon = config.icon;
                            
                            return (
                              <motion.div
                                key={role}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Object.keys(roleConfig).indexOf(role) * 0.05 }}
                              >
                                <Card className={`glass-card ${isActive ? 'border-emerald-500 glow-emerald' : 'hover:border-emerald-500/30'} transition-all`}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                                          <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{config.label}</h3>
                                            {isActive && (
                                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                <Check className="w-3 h-3 mr-1" />
                                                Active
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground">{config.description}</p>
                                        </div>
                                      </div>
                                      <Button
                                        onClick={() => isActive ? handleLogout() : handleDemoLogin(role as UserRole)}
                                        className={isActive 
                                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                          : `bg-gradient-to-r ${config.gradient}`
                                        }
                                      >
                                        {isActive ? (
                                          <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            Logout
                                          </>
                                        ) : (
                                          <>
                                            <Unlock className="w-4 h-4 mr-2" />
                                            Login as {config.label}
                                          </>
                                        )}
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      {config.features.map((feature) => (
                                        <button
                                          key={feature.path}
                                          onClick={() => {
                                            if (isAuthenticated) {
                                              setCurrentPage(feature.path);
                                              window.history.pushState({}, '', feature.path);
                                              setIsOpen(false);
                                            }
                                          }}
                                          disabled={!isAuthenticated}
                                          className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all ${
                                            isAuthenticated 
                                              ? 'hover:bg-muted/30 dark:hover:bg-white/5 cursor-pointer' 
                                              : 'opacity-50 cursor-not-allowed'
                                          }`}
                                        >
                                          <feature.icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                          <div className="min-w-0">
                                            <p className="font-medium truncate">{feature.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="current" className="m-0">
                      <ScrollArea className="h-[60vh] custom-scrollbar">
                        <div className="p-6 pb-6">
                          {isAuthenticated && user ? (
                            <div className="space-y-6">
                              {/* Current User Info */}
                              <Card className="glass-card border-emerald-500/30">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${roleConfig[user.role].gradient} flex items-center justify-center`}>
                                      {(() => {
                                        const Icon = roleConfig[user.role].icon;
                                        return <Icon className="w-8 h-8 text-white" />;
                                      })()}
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold">{user.name}</h3>
                                      <p className="text-muted-foreground">{user.email}</p>
                                      <Badge className="mt-2 bg-emerald-500/20 text-emerald-400">
                                        {user.role}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                                      <p className="text-2xl font-bold text-emerald-400">
                                        ${user.walletBalance?.toFixed(2) || '0.00'}
                                      </p>
                                      <p className="text-sm text-muted-foreground">Wallet</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                                      <p className="text-2xl font-bold text-cyan-400">
                                        {roleConfig[user.role].features.length}
                                      </p>
                                      <p className="text-sm text-muted-foreground">Features</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                                      <p className="text-2xl font-bold text-amber-400">
                                        {user.status}
                                      </p>
                                      <p className="text-sm text-muted-foreground">Status</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Quick Access to All Features */}
                              <div>
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                  <Zap className="w-5 h-5 text-emerald-400" />
                                  Quick Access - All {user.role} Features
                                </h4>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {roleConfig[user.role].features.map((feature) => (
                                    <Button
                                      key={feature.path}
                                      variant="outline"
                                      className="justify-start h-auto py-4 border-border hover:border-emerald-500/30 hover:bg-muted/30 dark:hover:bg-white/5"
                                      onClick={() => {
                                        setCurrentPage(feature.path);
                                        window.history.pushState({}, '', feature.path);
                                        setIsOpen(false);
                                      }}
                                    >
                                      <feature.icon className="w-5 h-5 mr-3 text-emerald-400" />
                                      <div className="text-left">
                                        <p className="font-medium">{feature.name}</p>
                                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                                      </div>
                                      <ChevronRight className="w-4 h-4 ml-auto" />
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-20 h-20 rounded-full bg-muted/30 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <Users className="w-10 h-10 text-muted-foreground" />
                              </div>
                              <h3 className="text-xl font-semibold mb-2">No Active Session</h3>
                              <p className="text-muted-foreground mb-6">
                                Select a role from the &quot;User Roles&quot; tab to start testing features
                              </p>
                              <Button 
                                className="bg-gradient-to-r from-emerald-500 to-teal-600"
                                onClick={() => handleDemoLogin('CLIENT')}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start as Client
                              </Button>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Feature permission matrix component for admin view
export function FeaturePermissionMatrix() {
  const features = [
    { name: 'Place Orders', roles: ['CLIENT'] as UserRole[] },
    { name: 'View Projects', roles: ['CLIENT', 'ADMIN', 'DEVELOPER'] as UserRole[] },
    { name: 'Claim Tasks', roles: ['EDITOR'] as UserRole[] },
    { name: 'Submit Work', roles: ['EDITOR'] as UserRole[] },
    { name: 'QA Review', roles: ['QA', 'ADMIN'] as UserRole[] },
    { name: 'Approve/Reject', roles: ['QA', 'ADMIN'] as UserRole[] },
    { name: 'Manage Users', roles: ['ADMIN', 'DEVELOPER'] as UserRole[] },
    { name: 'View Analytics', roles: ['ADMIN', 'DEVELOPER'] as UserRole[] },
    { name: 'System Config', roles: ['DEVELOPER'] as UserRole[] },
    { name: 'View Logs', roles: ['DEVELOPER'] as UserRole[] },
    { name: 'Manage Backups', roles: ['DEVELOPER'] as UserRole[] },
    { name: 'Impersonate Users', roles: ['DEVELOPER'] as UserRole[] },
  ];

  const allRoles: UserRole[] = ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Feature Permission Matrix
        </CardTitle>
        <CardDescription>
          Access levels for each user role
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-80 custom-scrollbar">
          <table className="w-full">
            <thead className="sticky top-0 bg-card/95 backdrop-blur">
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Feature</th>
                {allRoles.map((role) => (
                  <th key={role} className="text-center p-4 text-sm font-medium text-muted-foreground">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr
                  key={feature.name}
                  className={`border-b border-border/50 ${idx % 2 === 0 ? 'bg-muted/10' : ''}`}
                >
                  <td className="p-4 text-sm font-medium">{feature.name}</td>
                  {allRoles.map((role) => (
                    <td key={role} className="p-4 text-center">
                      {feature.roles.includes(role) ? (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
