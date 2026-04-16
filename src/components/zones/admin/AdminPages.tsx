'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, Settings, Terminal, Database, TrendingUp,
  DollarSign, Activity, AlertTriangle, CheckCircle, Eye, Shield,
  Download, RefreshCw, Server, Cpu, HardDrive, Wifi, Zap,
  UserPlus, Edit, Trash2, MoreVertical, Search, Filter,
  Bell, Lock, Palette, Globe, Mail, Phone, Camera, Save,
  ChevronRight, ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight, Clock, Calendar,
  CreditCard, Package, Star, Target, PieChart, LineChart,
  AlertCircle, Info, X, Check, Plus, Minus, ExternalLink,
  Key, Smartphone, Monitor, LogOut, FileText, Cloud, DatabaseBackup,
  BarChart2, TrendingDown, Layers, Gift, Award, Briefcase, Image as ImageIcon,
  Video, Wand2, Clock3, Upload, FileDown, FileSpreadsheet, Printer,
  LayoutDashboard, LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useAppStore } from '@/store/app-store';
import { useApi } from '@/hooks/use-api';
import type { UserRole, UserStatus } from '@/types/database';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminPayments } from './AdminPayments';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  orders: number;
  spent: number;
}

interface KPIData {
  label: string;
  value: number;
  change: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
}

interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'payment' | 'system' | 'alert';
  message: string;
  time: string;
  icon: LucideIcon;
}

// Mock data
const mockUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', role: 'CLIENT', status: 'ACTIVE', balance: 125.50, joinedAt: '2024-01-15', lastActive: '2h ago', orders: 45, spent: 2450 },
  { id: '2', name: 'Sarah Connor', email: 'sarah@example.com', role: 'EDITOR', status: 'ACTIVE', balance: 0, joinedAt: '2024-02-20', lastActive: '5m ago', orders: 0, spent: 0 },
  { id: '3', name: 'Mike Wilson', email: 'mike@example.com', role: 'CLIENT', status: 'SUSPENDED', balance: 45.00, joinedAt: '2024-01-10', lastActive: '3d ago', orders: 12, spent: 890 },
  { id: '4', name: 'Lisa Park', email: 'lisa@example.com', role: 'QA', status: 'ACTIVE', balance: 0, joinedAt: '2024-03-01', lastActive: '1h ago', orders: 0, spent: 0 },
  { id: '5', name: 'Alex Johnson', email: 'alex@example.com', role: 'DEVELOPER', status: 'ACTIVE', balance: 0, joinedAt: '2024-01-05', lastActive: '30m ago', orders: 0, spent: 0 },
  { id: '6', name: 'Emma Davis', email: 'emma@example.com', role: 'CLIENT', status: 'ACTIVE', balance: 350.00, joinedAt: '2024-02-28', lastActive: '1d ago', orders: 23, spent: 1890 },
];

const revenueData = [
  { month: 'Jan', revenue: 4200, orders: 89 },
  { month: 'Feb', revenue: 5100, orders: 102 },
  { month: 'Mar', revenue: 4800, orders: 95 },
  { month: 'Apr', revenue: 6200, orders: 128 },
  { month: 'May', revenue: 7100, orders: 145 },
  { month: 'Jun', revenue: 8400, orders: 167 },
];

const departmentData = [
  { name: 'Clipping Path', value: 45, color: '#10b981' },
  { name: 'Retouching', value: 25, color: '#14b8a6' },
  { name: 'Color Correction', value: 15, color: '#06b6d4' },
  { name: 'Web Development', value: 10, color: '#0891b2' },
  { name: 'Motion Graphics', value: 5, color: '#0e7490' },
];

const hourlyActivity = [
  { hour: '00', active: 2 },
  { hour: '04', active: 1 },
  { hour: '08', active: 8 },
  { hour: '12', active: 15 },
  { hour: '16', active: 12 },
  { hour: '20', active: 6 },
];

const chartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#10b981' },
  orders: { label: 'Orders', color: '#14b8a6' },
  active: { label: 'Active Users', color: '#06b6d4' },
  users: { label: 'Users', color: '#8b5cf6' },
};

// Role Access Indicator
function RoleAccessIndicator({ requiredRole, currentRole }: { requiredRole: string; currentRole: string }) {
  const roleHierarchy: Record<string, number> = {
    GUEST: 0, CLIENT: 1, EDITOR: 2, QA: 3, ADMIN: 4, DEVELOPER: 5
  };
  
  const hasAccess = roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${hasAccess ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <Shield className="w-3 h-3" />
            {hasAccess ? 'Admin Access' : 'Restricted'}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Required: {requiredRole} | Your role: {currentRole}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Real-time indicator
function RealtimeIndicator({ isLive }: { isLive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
      <span className="text-xs text-muted-foreground">{isLive ? 'Live' : 'Offline'}</span>
    </div>
  );
}

// System Status Card
function SystemStatusCard() {
  const systemMetrics = [
    { label: 'CPU', value: 45, icon: Cpu, status: 'healthy' },
    { label: 'Memory', value: 62, icon: HardDrive, status: 'healthy' },
    { label: 'Network', value: 98, icon: Wifi, status: 'healthy' },
    { label: 'Storage', value: 78, icon: Database, status: 'warning' },
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="w-5 h-5 text-emerald-400" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {systemMetrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-3">
            <metric.icon className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{metric.label}</span>
                <span className={`text-xs ${metric.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {metric.value}%
                </span>
              </div>
              <Progress value={metric.value} className="h-1" />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-400">All systems operational</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Feed Component
function ActivityFeed() {
  const activities: ActivityItem[] = [
    { id: '1', type: 'order', message: 'New order #1234 received from John Smith', time: '2 min ago', icon: Package },
    { id: '2', type: 'user', message: 'Sarah Connor completed task #567', time: '5 min ago', icon: CheckCircle },
    { id: '3', type: 'payment', message: 'Payment of $450 received from Emma Davis', time: '12 min ago', icon: DollarSign },
    { id: '4', type: 'system', message: 'Database backup completed successfully', time: '25 min ago', icon: DatabaseBackup },
    { id: '5', type: 'alert', message: 'High server load detected on Node 3', time: '1 hour ago', icon: AlertTriangle },
    { id: '6', type: 'order', message: 'Order #1230 marked as completed', time: '2 hours ago', icon: Package },
  ];

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      order: 'text-cyan-400 bg-cyan-500/20',
      user: 'text-purple-400 bg-purple-500/20',
      payment: 'text-emerald-400 bg-emerald-500/30 dark:bg-emerald-500/20',
      system: 'text-blue-400 bg-blue-500/20',
      alert: 'text-amber-400 bg-amber-500/20',
    };
    return colors[type] || 'text-muted-foreground bg-slate-500/20';
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-cyan-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="space-y-1 p-4 pt-0">
            {activities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 dark:bg-white/5 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  <activity.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    { label: 'Add User', icon: UserPlus, color: 'from-emerald-500 to-teal-600' },
    { label: 'New Order', icon: Plus, color: 'from-cyan-500 to-blue-600' },
    { label: 'View Reports', icon: BarChart3, color: 'from-purple-500 to-pink-600' },
    { label: 'Send Broadcast', icon: Mail, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action, idx) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Button
            className={`w-full h-auto py-4 flex-col gap-2 bg-gradient-to-r ${action.color} hover:opacity-90 transition-opacity`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-sm">{action.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

// Enhanced Admin Dashboard Component
export function AdminDashboard() {
  const [isLive, setIsLive] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    kpis?: { totalRevenue: number; totalOrders: number; totalUsers: number; activeOrders: number; growth: { revenue: number; orders: number; users: number } };
    charts?: { revenueTrend: Array<{ month: string; revenue: number }>; ordersByStatus: Array<{ status: string; count: number }>; tasksByDepartment: Array<{ department: string; count: number }> };
    recentActivity?: Array<{ id: string; type: string; message: string; time: string }>;
    departmentPerformance?: Array<{ name: string; active: number; completed: number; avgTime: string; efficiency: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAppStore();

  // Fetch comprehensive dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/statistics?scope=dashboard', {
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch dashboard');
        const data = await response.json();
        
        const formattedData = {
          kpis: data.kpis ? {
            totalRevenue: Number(data.kpis.totalRevenue) || 0,
            totalOrders: Number(data.kpis.totalOrders) || 0,
            totalUsers: Number(data.kpis.totalUsers) || 0,
            activeOrders: (Number(data.ordersByStatus?.PENDING) || 0) + (Number(data.ordersByStatus?.IN_PROGRESS) || 0),
            growth: {
              revenue: Number(data.kpis.revenueGrowth) || 0,
              orders: Number(data.kpis.orderGrowth) || 0,
              users: 0,
            },
          } : undefined,
          charts: {
            revenueTrend: (data.revenueTrend || []) as Array<{ month: string; revenue: number }>,
            ordersByStatus: data.ordersByStatus ? Object.entries(data.ordersByStatus).map(([status, count]) => ({ status, count: Number(count) })) : [],
            tasksByDepartment: data.tasksByDepartment ? Object.entries(data.tasksByDepartment).map(([department, count]) => ({ department, count: Number(count) })) : [],
          },
          recentActivity: data.recentActivity ? [
            ...(data.recentActivity.orders || []).map((o: Record<string, unknown>) => ({ id: o.id as string, type: 'order' as const, message: `${o.title}`, time: new Date(o.createdAt as string).toLocaleDateString() })),
            ...(data.recentActivity.tasks || []).map((t: Record<string, unknown>) => ({ id: t.id as string, type: 'task' as const, message: `${t.status}`, time: new Date(t.createdAt as string).toLocaleDateString() })),
          ] : [],
          departmentPerformance: (data.departmentPerformance || []) as Array<{ name: string; active: number; completed: number; avgTime: string; efficiency: number }>,
        };
        
        setDashboardData(formattedData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get KPI data from API response with fallbacks
  const kpiData: KPIData[] = [
    { label: 'Total Revenue', value: Number(dashboardData?.kpis?.totalRevenue) || 0, change: dashboardData?.kpis?.growth?.revenue || 16.3, prefix: '$', icon: DollarSign, trend: 'up' },
    { label: 'Total Orders', value: Number(dashboardData?.kpis?.totalOrders) || 0, change: dashboardData?.kpis?.growth?.orders || 14.5, icon: Package, trend: 'up' },
    { label: 'Active Users', value: Number(dashboardData?.kpis?.totalUsers) || 0, change: dashboardData?.kpis?.growth?.users || 18.0, icon: Users, trend: 'up' },
    { label: 'Active Orders', value: Number(dashboardData?.kpis?.activeOrders) || 0, change: 1.3, icon: CheckCircle, trend: 'up' },
  ];
  
  // Use API data for charts or fallback to defaults
  const chartRevenueData = dashboardData?.charts?.revenueTrend || revenueData;
  const chartDepartmentData = dashboardData?.charts?.tasksByDepartment?.map((d, i) => ({
    name: d.department,
    value: d.count,
    color: ['#10b981', '#14b8a6', '#06b6d4', '#0891b2', '#0e7490'][i % 5],
  })) || departmentData;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <RealtimeIndicator isLive={isLive} />
            </div>
            <p className="text-muted-foreground">Welcome back, {user?.name || 'Admin'}</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
            <Button variant="outline" className="border-border">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <QuickActions />
        </div>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiData.map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-card hover:border-emerald-500 transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{kpi.label}</span>
                    <div className="flex items-center gap-1">
                      <kpi.icon className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 dark:text-emerald-400 transition-colors" />
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {kpi.prefix || ''}{kpi.value.toLocaleString()}{kpi.suffix || ''}
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${kpi.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change)}% vs last period
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <AreaChart data={chartRevenueData}>
                  <defs>
                    <linearGradient id="revenueGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGradient2)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Order Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                Service Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <RechartsPieChart>
                  <Pie
                    data={chartDepartmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartDepartmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RechartsPieChart>
              </ChartContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {chartDepartmentData.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="text-muted-foreground">{dept.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>

          {/* System Status */}
          <SystemStatusCard />
        </div>
      </div>
    </div>
  );
}

// Admin Analytics Component
export function AdminAnalytics() {
  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState<{
    charts?: { revenueTrend: Array<{ month: string; revenue: number }>; tasksByDepartment: Array<{ department: string; count: number }> };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAppStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/statistics?scope=dashboard', {
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        
        setDashboardData({
          charts: {
            revenueTrend: (data.revenueTrend || []) as Array<{ month: string; revenue: number }>,
            tasksByDepartment: data.tasksByDepartment ? Object.entries(data.tasksByDepartment).map(([department, count]) => ({ department, count: Number(count) })) : [],
          },
        });
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive(true);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const kpiData: KPIData[] = [
    { label: 'Total Revenue', value: 45250, change: 16.3, prefix: '$', icon: DollarSign, trend: 'up' },
    { label: 'Total Orders', value: 1247, change: 14.5, icon: Package, trend: 'up' },
    { label: 'Active Users', value: 892, change: 18.0, icon: Users, trend: 'up' },
    { label: 'Completion Rate', value: 98.5, change: 1.3, suffix: '%', icon: CheckCircle, trend: 'up' },
  ];

  const chartRevenueData = dashboardData?.charts?.revenueTrend || revenueData;
  const chartDepartmentData = dashboardData?.charts?.tasksByDepartment?.map((d, i) => ({
    name: d.department,
    value: d.count,
    color: ['#10b981', '#14b8a6', '#06b6d4', '#0891b2', '#0e7490'][i % 5],
  })) || departmentData;

  const departmentStats = [
    { name: 'Clipping Path', active: 12, completed: 324, avgTime: '45min', efficiency: 95 },
    { name: 'Retouching', active: 8, completed: 156, avgTime: '1.2h', efficiency: 88 },
    { name: 'Color Correction', active: 5, completed: 89, avgTime: '35min', efficiency: 92 },
    { name: 'Motion Graphics', active: 3, completed: 23, avgTime: '3h', efficiency: 85 },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">Global Analytics</h1>
              <RealtimeIndicator isLive={isLive} />
            </div>
            <p className="text-muted-foreground">System-wide performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-muted/30 dark:bg-white/5 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiData.map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-card hover:border-emerald-500 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{kpi.label}</span>
                    <div className="flex items-center gap-1">
                      <kpi.icon className="w-4 h-4 text-muted-foreground" />
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {kpi.prefix || ''}{kpi.value.toLocaleString()}{kpi.suffix || ''}
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${kpi.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change)}% vs last period
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <AreaChart data={chartRevenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                Department Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <RechartsPieChart>
                  <Pie
                    data={chartDepartmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartDepartmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RechartsPieChart>
              </ChartContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {chartDepartmentData.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="text-muted-foreground">{dept.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Departments */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hourly Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Hourly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48">
                <BarChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="active" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Real-time department metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept, idx) => (
                  <motion.div
                    key={dept.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 dark:bg-white/5 hover:bg-accent dark:hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{dept.name}</h4>
                        <p className="text-sm text-muted-foreground">{dept.completed} completed today</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Active</p>
                          <p className="font-bold text-lg text-emerald-400">{dept.active}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Avg Time</p>
                          <p className="font-bold text-lg">{dept.avgTime}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Efficiency</p>
                          <p className="font-bold text-lg text-cyan-400">{dept.efficiency}%</p>
                        </div>
                      </div>
                    </div>
                    <Progress value={dept.efficiency} className="h-1" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Admin Users Component (User CRM)
export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');
  const { user: currentUser } = useAppStore();

  const handleScroll = (direction: 'top' | 'bottom') => {
    const scrollContainer = document.getElementById('users-table-scroll');
    if (scrollContainer) {
      const viewport = scrollContainer.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({
          top: direction === 'top' ? 0 : viewport.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        scrollContainer.scrollTo({
          top: direction === 'top' ? 0 : scrollContainer.scrollHeight,
          behavior: 'smooth',
        });
      }
      setScrollDirection(direction);
    }
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterRole !== 'all') params.append('role', filterRole);
        if (filterStatus !== 'all') params.append('status', filterStatus);
        if (searchQuery) params.append('search', searchQuery);
        
        const response = await fetch(`/api/users?${params.toString()}`, {
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        if (!data.users) throw new Error('Invalid response');
        
        const mappedUsers = data.users.map((u: Record<string, unknown>) => ({
          id: u.id as string,
          name: (u.name as string) || 'Unknown',
          email: u.email as string,
          role: u.role as UserRole,
          status: u.status as UserStatus,
          balance: (u.walletBalance as number) || 0,
          avatar: u.avatar as string | undefined,
          joinedAt: new Date(u.createdAt as string).toLocaleDateString(),
          lastActive: u.lastLoginAt ? new Date(u.lastLoginAt as string).toLocaleDateString() : 'Never',
          orders: (u._count as { orders?: number })?.orders || 0,
          spent: 0,
        }));
        setUsers(mappedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filterRole, filterStatus, searchQuery]);

  const filteredUsers = users;

  const getRoleBadge = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      GUEST: 'bg-slate-500/20 text-muted-foreground',
      CLIENT: 'bg-blue-500/20 text-blue-400',
      EDITOR: 'bg-purple-500/20 text-purple-400',
      QA: 'bg-amber-500/20 text-amber-400',
      ADMIN: 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400',
      DEVELOPER: 'bg-cyan-500/20 text-cyan-400',
    };
    return <Badge className={styles[role]}>{role}</Badge>;
  };

  const getStatusBadge = (status: UserStatus) => {
    const styles: Record<UserStatus, string> = {
      PENDING: 'bg-amber-500/20 text-amber-400',
      ACTIVE: 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400',
      SUSPENDED: 'bg-amber-500/20 text-amber-400',
      BANNED: 'bg-red-500/20 text-red-400',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">User CRM</h1>
            <p className="text-muted-foreground">Manage users and permissions</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="ADMIN" currentRole={currentUser?.role || 'GUEST'} />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user account</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="Full name" className="bg-muted/30 dark:bg-white/5 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="email@example.com" type="email" className="bg-muted/30 dark:bg-white/5 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select>
                      <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLIENT">Client</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="QA">QA</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="border-border">Cancel</Button>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Users', value: users.length, color: 'text-white' },
            { label: 'Clients', value: users.filter(u => u.role === 'CLIENT').length, color: 'text-blue-400' },
            { label: 'Editors', value: users.filter(u => u.role === 'EDITOR').length, color: 'text-purple-400' },
            { label: 'QA', value: users.filter(u => u.role === 'QA').length, color: 'text-amber-400' },
            { label: 'Admins', value: users.filter(u => ['ADMIN', 'DEVELOPER'].includes(u.role)).length, color: 'text-emerald-400' },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 dark:bg-white/5 border-border"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-40 bg-muted/30 dark:bg-white/5 border-border">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="CLIENT">Client</SelectItem>
              <SelectItem value="EDITOR">Editor</SelectItem>
              <SelectItem value="QA">QA</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="DEVELOPER">Developer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40 bg-muted/30 dark:bg-white/5 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="BANNED">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Table */}
        <Card className="glass-card overflow-hidden relative">
          <ScrollArea className="max-h-[600px]" id="users-table-scroll">
            <table className="w-full">
              <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Activity</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stats</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((u, idx) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/30 dark:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600">
                              {u.name?.split(' ')?.slice(0, 2)?.map(n => n?.[0])?.join('') || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getRoleBadge(u.role)}</td>
                      <td className="p-4">{getStatusBadge(u.status)}</td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm">Last: {u.lastActive}</p>
                          <p className="text-xs text-muted-foreground">Joined: {u.joinedAt}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.role === 'CLIENT' && (
                          <div className="text-sm">
                            <p>{u.orders} orders</p>
                            <p className="text-muted-foreground">${u.spent} spent</p>
                          </div>
                        )}
                        {u.role !== 'CLIENT' && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Select value={u.role} onValueChange={(value) => handleRoleChange(u.id, value as UserRole)}>
                            <SelectTrigger className="w-24 h-8 bg-muted/30 dark:bg-white/5 border-border text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CLIENT">Client</SelectItem>
                              <SelectItem value="EDITOR">Editor</SelectItem>
                              <SelectItem value="QA">QA</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="DEVELOPER">Dev</SelectItem>
                            </SelectContent>
                          </Select>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedUser(u)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {u.status === 'ACTIVE' ? (
                                <DropdownMenuItem onClick={() => handleStatusChange(u.id, 'SUSPENDED')} className="text-amber-400">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleStatusChange(u.id, 'ACTIVE')} className="text-emerald-400">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleStatusChange(u.id, 'BANNED')} className="text-red-400">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </ScrollArea>
          
          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-lg"
              onClick={() => handleScroll('top')}
              title="Scroll to top"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-lg"
              onClick={() => handleScroll('bottom')}
              title="Scroll to bottom"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Admin Settings Component
export function AdminSettings() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'ClippingPath & Website Services Studio',
    siteDescription: 'Professional Image Editing Services',
    logoUrl: '/icon', // Dynamic favicon route
    timezone: 'UTC-5',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    ipWhitelist: [] as string[],
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    systemAlerts: true,
    marketingEmails: false,
    weeklyReports: true,
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production API Key', key: 'pk_live_**********************', created: '2024-01-15', lastUsed: '2 hours ago' },
    { id: '2', name: 'Test API Key', key: 'pk_test_**********************', created: '2024-02-20', lastUsed: '5 days ago' },
  ]);

  const handleSaveSettings = () => {
    // Save settings logic
  };

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Settings</h1>
            <p className="text-muted-foreground">Manage system configuration</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
            <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/30 dark:bg-white/5 border border-border">
            <TabsTrigger value="general" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Settings className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general">
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    Site Information
                  </CardTitle>
                  <CardDescription>Basic site configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Site Name</Label>
                      <Input
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                        className="bg-muted/30 dark:bg-white/5 border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={generalSettings.language}
                        onValueChange={(v) => setGeneralSettings(prev => ({ ...prev, language: v }))}
                      >
                        <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Site Description</Label>
                    <Textarea
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                      className="bg-muted/30 dark:bg-white/5 border-border"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Logo URL
                    </Label>
                    <div className="flex gap-4">
                      <Input
                        value={generalSettings.logoUrl}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                        className="bg-muted/30 dark:bg-white/5 border-border flex-1"
                      />
                      <Button variant="outline" className="border-border">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Regional Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={generalSettings.timezone}
                        onValueChange={(v) => setGeneralSettings(prev => ({ ...prev, timezone: v }))}
                      >
                        <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="UTC-5">UTC-5 (Eastern)</SelectItem>
                          <SelectItem value="UTC-8">UTC-8 (Pacific)</SelectItem>
                          <SelectItem value="UTC+1">UTC+1 (Central Europe)</SelectItem>
                          <SelectItem value="UTC+6">UTC+6 (Bangladesh)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select
                        value={generalSettings.dateFormat}
                        onValueChange={(v) => setGeneralSettings(prev => ({ ...prev, dateFormat: v }))}
                      >
                        <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Authentication
                  </CardTitle>
                  <CardDescription>Configure security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-purple-500/20">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Select
                        value={securitySettings.sessionTimeout.toString()}
                        onValueChange={(v) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(v) }))}
                      >
                        <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Login Attempts</Label>
                      <Select
                        value={securitySettings.maxLoginAttempts.toString()}
                        onValueChange={(v) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(v) }))}
                      >
                        <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 attempts</SelectItem>
                          <SelectItem value="5">5 attempts</SelectItem>
                          <SelectItem value="10">10 attempts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password Expiry (days)</Label>
                    <Select
                      value={securitySettings.passwordExpiry.toString()}
                      onValueChange={(v) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(v) }))}
                    >
                      <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="0">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { device: 'Chrome on Windows', location: 'New York, US', current: true },
                    { device: 'Safari on iPhone', location: 'Los Angeles, US', current: false },
                    { device: 'Firefox on MacOS', location: 'London, UK', current: false },
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{session.device}</p>
                          <p className="text-sm text-muted-foreground">{session.location}</p>
                        </div>
                        {session.current && (
                          <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400">Current</Badge>
                        )}
                      </div>
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                          <LogOut className="w-4 h-4 mr-2" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-border text-red-400 hover:text-red-300">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out All Other Sessions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Settings Tab */}
          <TabsContent value="notifications">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground/80 mb-3">Delivery Methods</h4>
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Critical alerts via SMS' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground/80 mb-3">Notification Types</h4>
                  {[
                    { key: 'orderUpdates', label: 'Order Updates', desc: 'New orders, status changes, completions' },
                    { key: 'systemAlerts', label: 'System Alerts', desc: 'Server issues, security warnings' },
                    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotions, newsletters' },
                    { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Summary of weekly activity' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api">
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-cyan-400" />
                        API Keys
                      </CardTitle>
                      <CardDescription>Manage API keys for integrations</CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Generate New Key
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-4 rounded-lg bg-muted/30 dark:bg-white/5 border border-border">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{apiKey.name}</p>
                          <p className="text-sm text-muted-foreground">Created: {apiKey.created}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-slate-800/50">
                        <code className="text-sm text-emerald-400 flex-1">{apiKey.key}</code>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Last used: {apiKey.lastUsed}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    API Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Integrate ClippingPath & Website Services Studio with your applications using our REST API.
                  </p>
                  <Button variant="outline" className="border-border">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Documentation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Admin Reports Component
export function AdminReports() {
  const { user } = useAppStore();
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('revenue');
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');

  const handleScroll = (containerId: string, direction: 'top' | 'bottom') => {
    const el = document.getElementById(containerId);
    if (el) {
      const viewport = el.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: direction === 'top' ? 0 : viewport.scrollHeight, behavior: 'smooth' });
      } else {
        el.scrollTo({ top: direction === 'top' ? 0 : el.scrollHeight, behavior: 'smooth' });
      }
      setScrollDirection(direction);
    }
  };

  // Mock data for reports
  const revenueReportData = [
    { period: 'Week 1', revenue: 8200, orders: 156, avgOrderValue: 52.56 },
    { period: 'Week 2', revenue: 9100, orders: 178, avgOrderValue: 51.12 },
    { period: 'Week 3', revenue: 7850, orders: 142, avgOrderValue: 55.28 },
    { period: 'Week 4', revenue: 10200, orders: 198, avgOrderValue: 51.52 },
  ];

  const userGrowthData = [
    { month: 'Jan', users: 120, newUsers: 45 },
    { month: 'Feb', users: 185, newUsers: 65 },
    { month: 'Mar', users: 245, newUsers: 60 },
    { month: 'Apr', users: 320, newUsers: 75 },
    { month: 'May', users: 410, newUsers: 90 },
    { month: 'Jun', users: 520, newUsers: 110 },
  ];

  const servicePerformanceData = [
    { service: 'Clipping Path', completed: 1245, avgTime: '45 min', rating: 4.9, revenue: 24500 },
    { service: 'Retouching', completed: 856, avgTime: '1.2 hr', rating: 4.8, revenue: 18200 },
    { service: 'Color Correction', completed: 423, avgTime: '35 min', rating: 4.7, revenue: 8500 },
    { service: 'Background Removal', completed: 1567, avgTime: '20 min', rating: 4.9, revenue: 15600 },
    { service: 'Image Masking', completed: 234, avgTime: '2 hr', rating: 4.6, revenue: 9200 },
  ];

  const handleExport = (format: string) => {
    // Export report logic
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Reports</h1>
            <p className="text-muted-foreground">Analytics and performance reports</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40 bg-muted/30 dark:bg-white/5 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('print')}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Report Type Tabs */}
        <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
          <TabsList className="bg-muted/30 dark:bg-white/5 border border-border">
            <TabsTrigger value="revenue" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Users className="w-4 h-4 mr-2" />
              User Growth
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Layers className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
          </TabsList>

          {/* Revenue Report */}
          <TabsContent value="revenue">
            <div className="space-y-6">
              {/* Revenue Summary Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: '$35,350', change: '+12.5%', trend: 'up', icon: DollarSign },
                  { label: 'Total Orders', value: '674', change: '+8.2%', trend: 'up', icon: Package },
                  { label: 'Avg Order Value', value: '$52.45', change: '+3.1%', trend: 'up', icon: Target },
                  { label: 'Refunds', value: '$450', change: '-15.3%', trend: 'down', icon: TrendingDown },
                ].map((metric, idx) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="glass-card">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <metric.icon className="w-5 h-5 text-muted-foreground" />
                          <Badge className={metric.trend === 'up' ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                            {metric.change}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Revenue Chart */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-72">
                    <RechartsLineChart data={revenueReportData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} />
                    </RechartsLineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Revenue Breakdown Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[300px]" id="revenue-scroll">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-card/95">
                        <tr className="border-b border-border">
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Period</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Orders</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Avg Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueReportData.map((row, idx) => (
                          <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 dark:bg-white/5 transition-colors">
                            <td className="p-4 font-medium">{row.period}</td>
                            <td className="p-4 text-right text-emerald-400">${row.revenue.toLocaleString()}</td>
                            <td className="p-4 text-right">{row.orders}</td>
                            <td className="p-4 text-right">${row.avgOrderValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                  
                  <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('revenue-scroll', 'top')}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('revenue-scroll', 'bottom')}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Growth Report */}
          <TabsContent value="users">
            <div className="space-y-6">
              {/* User Summary Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: '1,803', change: '+18.5%', icon: Users },
                  { label: 'New This Month', value: '245', change: '+22.1%', icon: UserPlus },
                  { label: 'Active Users', value: '892', change: '+12.3%', icon: Activity },
                  { label: 'Churn Rate', value: '2.3%', change: '-0.5%', icon: TrendingDown },
                ].map((metric, idx) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="glass-card">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <metric.icon className="w-5 h-5 text-muted-foreground" />
                          <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400">{metric.change}</Badge>
                        </div>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* User Growth Chart */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    User Growth Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-72">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="url(#userGradient)" strokeWidth={2} />
                      <Area type="monotone" dataKey="newUsers" stroke="#10b981" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                  </ChartContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-sm text-muted-foreground">Total Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-emerald-500" style={{ width: '12px' }} />
                      <span className="text-sm text-muted-foreground">New Users</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Distribution */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>User Distribution by Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { role: 'Clients', count: 1456, percentage: 80.7, color: 'bg-blue-500' },
                        { role: 'Editors', count: 198, percentage: 11.0, color: 'bg-purple-500' },
                        { role: 'QA', count: 89, percentage: 4.9, color: 'bg-amber-500' },
                        { role: 'Admins', count: 60, percentage: 3.3, color: 'bg-emerald-500' },
                      ].map((item) => (
                        <div key={item.role} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{item.role}</span>
                            <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { period: 'Today', active: 156, label: 'Active now' },
                        { period: 'This Week', active: 423, label: 'Active users' },
                        { period: 'This Month', active: 892, label: 'Active users' },
                        { period: 'Inactive 30+ days', active: 245, label: 'Need engagement' },
                      ].map((item) => (
                        <div key={item.period} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 dark:bg-white/5">
                          <div>
                            <p className="font-medium">{item.period}</p>
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                          </div>
                          <span className="text-2xl font-bold text-emerald-400">{item.active}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Service Performance Report */}
          <TabsContent value="services">
            <div className="space-y-6">
              {/* Service Summary Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Services Offered', value: '12', icon: Layers },
                  { label: 'Total Completed', value: '4,325', icon: CheckCircle },
                  { label: 'Avg Rating', value: '4.8', icon: Star },
                  { label: 'Total Revenue', value: '$76,000', icon: DollarSign },
                ].map((metric, idx) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="glass-card">
                      <CardContent className="p-6">
                        <metric.icon className="w-5 h-5 text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Service Performance Chart */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-cyan-400" />
                    Service Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-72">
                    <BarChart data={servicePerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="service" type="category" stroke="#64748b" fontSize={12} width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="completed" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Service Performance Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Service Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[400px]" id="service-scroll">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-card/95">
                        <tr className="border-b border-border">
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Service</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Completed</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Avg Time</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Rating</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {servicePerformanceData.map((row, idx) => (
                          <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 dark:bg-white/5 transition-colors">
                            <td className="p-4 font-medium">{row.service}</td>
                            <td className="p-4 text-right">{row.completed.toLocaleString()}</td>
                            <td className="p-4 text-right">{row.avgTime}</td>
                            <td className="p-4 text-right">
                              <StarRating rating={row.rating} size="sm" showValue />
                            </td>
                            <td className="p-4 text-right text-emerald-400">${row.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                  
                  <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('service-scroll', 'top')}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('service-scroll', 'bottom')}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Admin Site CMS Component
export function AdminSiteCMS() {
  const [siteName, setSiteName] = useState('ClippingPath & Website Services Studio');
  const [logoUrl, setLogoUrl] = useState('/icon'); // Dynamic favicon route
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [accentColor, setAccentColor] = useState('#14b8a6');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [smtpSettings, setSmtpSettings] = useState({
    host: 'smtp.example.com',
    port: '587',
    user: 'noreply@example.com',
  });
  const { user } = useAppStore();

  const handleSave = () => {
    // Save settings logic
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Site CMS</h1>
            <p className="text-muted-foreground">Dynamic branding and settings</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
            <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="bg-muted/30 dark:bg-white/5 border border-border">
            <TabsTrigger value="branding" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="navigation" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Globe className="w-4 h-4 mr-2" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Brand Assets</CardTitle>
                  <CardDescription>Configure your brand identity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Logo URL
                    </Label>
                    <div className="flex gap-4">
                      <Input
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="bg-muted/30 dark:bg-white/5 border-border flex-1"
                      />
                      <Button variant="outline" className="border-border">Upload</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Site Name</Label>
                    <Input
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="bg-muted/30 dark:bg-white/5 border-border"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-14 h-10 p-1 bg-muted/30 dark:bg-white/5 border-border"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="bg-muted/30 dark:bg-white/5 border-border flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-14 h-10 p-1 bg-muted/30 dark:bg-white/5 border-border"
                        />
                        <Input
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="bg-muted/30 dark:bg-white/5 border-border flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                      />
                      <span className="font-bold text-lg">{siteName}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" style={{ background: primaryColor }}>
                        Primary Button
                      </Button>
                      <Button size="sm" variant="outline" style={{ borderColor: accentColor, color: accentColor }}>
                        Accent Button
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Navigation Links</CardTitle>
                <CardDescription>Configure navbar and footer links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Home', path: '/', enabled: true },
                  { label: 'Services', path: '/services', enabled: true },
                  { label: 'Portfolio', path: '/portfolio', enabled: true },
                  { label: 'Pricing', path: '/pricing', enabled: true },
                  { label: 'Contact', path: '/contact', enabled: true },
                ].map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{link.label}</p>
                        <p className="text-sm text-muted-foreground">{link.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={link.enabled} />
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-border">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Navigation Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Show maintenance page to visitors</p>
                    </div>
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <div>
                      <p className="font-medium">Allow Registration</p>
                      <p className="text-sm text-muted-foreground">Enable new user registration</p>
                    </div>
                    <Switch checked={allowRegistration} onCheckedChange={setAllowRegistration} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meta Title</Label>
                    <Input
                      defaultValue="ClippingPath & Website Services Studio - Professional Image Editing Services"
                      className="bg-muted/30 dark:bg-white/5 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea
                      defaultValue="Professional image editing services including clipping path, retouching, and color correction."
                      className="bg-muted/30 dark:bg-white/5 border-border"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
                <CardDescription>Configure email delivery settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input
                      value={smtpSettings.host}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, host: e.target.value }))}
                      className="bg-muted/30 dark:bg-white/5 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Port</Label>
                    <Input
                      value={smtpSettings.port}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, port: e.target.value }))}
                      className="bg-muted/30 dark:bg-white/5 border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={smtpSettings.user}
                    onChange={(e) => setSmtpSettings(prev => ({ ...prev, user: e.target.value }))}
                    className="bg-muted/30 dark:bg-white/5 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-muted/30 dark:bg-white/5 border-border"
                  />
                </div>
                <Button variant="outline" className="border-border">
                  Send Test Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Admin Profile Component
export function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAppStore();
  
  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@example.com',
    phone: '+1 234 567 890',
    timezone: 'UTC-5',
    language: 'en',
    twoFactorEnabled: true,
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  });

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Admin Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>
          <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="glass-card lg:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.avatar || ''} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    {profile.name?.split(' ')?.slice(0, 2)?.map(n => n?.[0])?.join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 border-border"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{user?.role || 'ADMIN'}</p>
              <Badge className="mt-2 bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
              
              <div className="mt-6 pt-6 border-t border-border">
                <div className="text-left space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground/80">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground/80">{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground/80">{profile.timezone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Account Settings</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-muted/30 dark:bg-white/5 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-muted/30 dark:bg-white/5 border-border"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-muted/30 dark:bg-white/5 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={profile.timezone} onValueChange={(v) => setProfile(prev => ({ ...prev, timezone: v }))} disabled={!isEditing}>
                      <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="UTC-5">UTC-5 (Eastern)</SelectItem>
                        <SelectItem value="UTC-8">UTC-8 (Pacific)</SelectItem>
                        <SelectItem value="UTC+1">UTC+1 (Central Europe)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch 
                    checked={profile.twoFactorEnabled} 
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, twoFactorEnabled: checked }))} 
                  />
                </div>
                <Button variant="outline" className="w-full border-border">
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'sms', label: 'SMS Alerts', desc: 'Critical alerts via SMS' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={profile.notifications[item.key as keyof typeof profile.notifications]}
                      onCheckedChange={(checked) => 
                        setProfile(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, [item.key]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Reviews Component - Manage Client Reviews
interface ClientReview {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  content: string;
  rating: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [counts, setCounts] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const [selectedReview, setSelectedReview] = useState<ClientReview | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');
  const { user } = useAppStore();

  const handleScroll = (direction: 'top' | 'bottom') => {
    const el = document.getElementById('reviews-list-scroll');
    if (el) {
      const viewport = el.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: direction === 'top' ? 0 : viewport.scrollHeight, behavior: 'smooth' });
      } else {
        el.scrollTo({ top: direction === 'top' ? 0 : el.scrollHeight, behavior: 'smooth' });
      }
      setScrollDirection(direction);
    }
  };

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/reviews?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();
      // Debug: Remove console.log in production
      if (data.success) {
        setReviews(data.data || []);
        setCounts(data.counts || { PENDING: 0, APPROVED: 0, REJECTED: 0 });
      } else {
        console.error('API error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleStatusUpdate = async (reviewId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      setIsProcessing(reviewId);
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          id: reviewId,
          status: newStatus,
          reviewNote: reviewNote || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setCounts((prev) => ({
          ...prev,
          PENDING: prev.PENDING - 1,
          [newStatus]: prev[newStatus] + 1,
        }));
        setSelectedReview(null);
        setReviewNote('');
      }
    } catch (error) {
      console.error('Error updating review:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      setIsProcessing(reviewId);
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setSelectedReview(null);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      APPROVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return <Badge className={styles[status] || ''}>{status}</Badge>;
  };

  const renderStars = (rating: number) => {
    return <StarRating rating={rating} size="sm" />;
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Client Reviews</h1>
            <p className="text-muted-foreground">Manage and approve client testimonials</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
            <Button variant="outline" className="border-border" onClick={fetchReviews}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Counts */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card 
            className={`glass-card cursor-pointer transition-all ${statusFilter === 'PENDING' ? 'border-amber-500/50' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'all' : 'PENDING')}
          >
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">{counts.PENDING}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card 
            className={`glass-card cursor-pointer transition-all ${statusFilter === 'APPROVED' ? 'border-emerald-500/50' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'APPROVED' ? 'all' : 'APPROVED')}
          >
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{counts.APPROVED}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card 
            className={`glass-card cursor-pointer transition-all ${statusFilter === 'REJECTED' ? 'border-red-500/50' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? 'all' : 'REJECTED')}
          >
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{counts.REJECTED}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' ? `No ${statusFilter.toLowerCase()} reviews.` : 'No client reviews yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 relative">
            {/* Review List */}
            <ScrollArea className="max-h-[600px]" id="reviews-list-scroll">
              <div className="space-y-4 pr-4">
              <AnimatePresence>
                {reviews.map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card 
                      className={`glass-card cursor-pointer transition-all hover:border-emerald-500/30 ${
                        selectedReview?.id === review.id ? 'border-emerald-500/50' : ''
                      }`}
                      onClick={() => {
                        setSelectedReview(review);
                        setReviewNote(review.reviewNote || '');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{review.name}</h4>
                              {getStatusBadge(review.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.email}</p>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm line-clamp-2">{review.content}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span>{review.company || 'No company'}</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              </div>
            </ScrollArea>
            
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('top')}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('bottom')}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Review Detail */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              {selectedReview ? (
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        Review Details
                      </CardTitle>
                      {getStatusBadge(selectedReview.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedReview.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedReview.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{selectedReview.company || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Role</p>
                        <p className="font-medium">{selectedReview.role || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Rating</p>
                      {renderStars(selectedReview.rating)}
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Review Content</p>
                      <p className="p-3 rounded-lg bg-muted/30 dark:bg-white/5">{selectedReview.content}</p>
                    </div>

                    {selectedReview.status === 'PENDING' && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Admin Note (Optional)</p>
                        <Textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Add a note..."
                          className="bg-muted/30 dark:bg-white/5 border-border resize-none"
                          rows={2}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {selectedReview.status === 'PENDING' && (
                        <>
                          <Button
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={() => handleStatusUpdate(selectedReview.id, 'APPROVED')}
                            disabled={isProcessing === selectedReview.id}
                          >
                            {isProcessing === selectedReview.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleStatusUpdate(selectedReview.id, 'REJECTED')}
                            disabled={isProcessing === selectedReview.id}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(selectedReview.id)}
                        disabled={isProcessing === selectedReview.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                      Submitted: {new Date(selectedReview.createdAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-12 text-center">
                    <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a review to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Admin Page Content Router - renders the appropriate component
function AdminPageContent() {
  const { currentPage } = useAppStore();

  // Route to the appropriate admin component based on current path
  if (currentPage === '/admin' || currentPage === '/admin/dashboard') {
    return <AdminDashboard />;
  }
  
  if (currentPage.startsWith('/admin/analytics')) {
    return <AdminAnalytics />;
  }
  
  if (currentPage.startsWith('/admin/users')) {
    return <AdminUsers />;
  }
  
  if (currentPage.startsWith('/admin/orders')) {
    return <AdminOrders />;
  }
  
  if (currentPage.startsWith('/admin/services')) {
    return <AdminServices />;
  }
  
  if (currentPage.startsWith('/admin/payments')) {
    return <AdminPayments />;
  }
  
  if (currentPage.startsWith('/admin/cms') || currentPage.startsWith('/admin/pages') || currentPage.startsWith('/admin/blog') || currentPage.startsWith('/admin/faq')) {
    return <AdminSiteCMS />;
  }
  
  if (currentPage.startsWith('/admin/settings')) {
    return <AdminSettings />;
  }
  
  if (currentPage.startsWith('/admin/reports')) {
    return <AdminReports />;
  }
  
  if (currentPage.startsWith('/admin/reviews')) {
    return <AdminReviews />;
  }
  
  if (currentPage.startsWith('/admin/profile')) {
    return <AdminProfile />;
  }
  
  // Default to dashboard
  return <AdminDashboard />;
}

// Admin Pages Router Component with Sidebar
export function AdminPages() {
  const { user, isAuthenticated } = useAppStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'DEVELOPER';

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Admin Sidebar */}
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <main 
        className="transition-all duration-300 min-h-[calc(100vh-4rem)]"
        style={{ marginLeft: sidebarCollapsed ? '72px' : '256px' }}
      >
        <AdminPageContent />
      </main>
    </div>
  );
}

// Admin Orders Component
export function AdminOrders() {
  const [orders, setOrders] = useState<Array<{
    id: string;
    orderNumber: string;
    title: string;
    status: string;
    priority: string;
    totalAmount: number;
    clientName: string;
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');
  const { user } = useAppStore();

  const handleScroll = (direction: 'top' | 'bottom') => {
    const el = document.getElementById('orders-scroll');
    if (el) {
      const viewport = el.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: direction === 'top' ? 0 : viewport.scrollHeight, behavior: 'smooth' });
      } else {
        el.scrollTo({ top: direction === 'top' ? 0 : el.scrollHeight, behavior: 'smooth' });
      }
      setScrollDirection(direction);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/orders?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-500/20 text-slate-400',
      PENDING: 'bg-amber-500/20 text-amber-400',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
      QA: 'bg-purple-500/20 text-purple-400',
      REVISION: 'bg-orange-500/20 text-orange-400',
      COMPLETED: 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400',
      DELIVERED: 'bg-cyan-500/20 text-cyan-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      STANDARD: 'text-muted-foreground',
      EXPRESS: 'text-amber-400',
      NITRO: 'text-red-400',
    };
    return colors[priority] || 'text-muted-foreground';
  };

  const filteredOrders = orders;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Orders Management</h1>
            <p className="text-muted-foreground">Manage all client orders</p>
          </div>
          <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 dark:bg-white/5 border-border"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-muted/30 dark:bg-white/5 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="QA">QA</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card className="glass-card relative">
          <ScrollArea className="max-h-[600px]" id="orders-scroll">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-card/95 backdrop-blur">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border/50 hover:bg-muted/30 dark:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.title}</p>
                          <p className="text-sm text-muted-foreground">#{order.orderNumber}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{order.clientName || 'Unknown'}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-medium ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-emerald-400">
                        ${Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </ScrollArea>
          
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('top')}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('bottom')}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Admin Services Component
export function AdminServices() {
  const [services, setServices] = useState<Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    basePrice: number;
    turnaround: number;
    isActive: boolean;
    _count?: { orders: number };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppStore();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/services?includePricing=true', {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data.data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Services Management</h1>
            <p className="text-muted-foreground">Configure services and pricing</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading services...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {service.isActive ? (
                        <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400">Active</Badge>
                      ) : (
                        <Badge className="bg-slate-500/20 text-slate-400">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">/{service.slug}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">{service.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Price</span>
                        <span className="font-medium text-emerald-400">${Number(service.basePrice).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Turnaround</span>
                        <span className="font-medium">{service.turnaround}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="font-medium">{service._count?.orders || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 border-border">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {services.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No services found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
