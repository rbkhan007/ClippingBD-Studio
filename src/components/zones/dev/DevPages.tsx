'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, CheckCircle, Clock, Cpu, Database,
  Download, HardDrive, RefreshCw, Server, Terminal, Wifi,
  XCircle, AlertCircle, Info, Trash2, Archive, Shield,
  Play, Pause, RotateCcw, ChevronDown, ChevronUp, ChevronRight,
  Copy, ExternalLink, Filter, Search, Calendar, Zap,
  TrendingUp, TrendingDown, Minus, Bug, FileCode,
  Settings, Bell, Power, Upload, FileJson, FileArchive,
  Check, X, MoreVertical, Eye, Lock, Globe, Key, Layers,
  BarChart3, PieChart, Gauge, Slack, Mail, Webhook,
  FileText, Code, Book, BookOpen, Link2, Timer,
  CircleDot, Square, ToggleLeft, ToggleRight, Save,
  Import, Plus, Edit3, EyeOff, LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/store/app-store';
import { useApi } from '@/hooks/use-api';

// Types
interface SystemMetric {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  icon: LucideIcon;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  source: string;
  message: string;
  details?: string;
}

interface BackupRecord {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  type: 'AUTOMATIC' | 'MANUAL';
}

// Mock data
const latencyData = [
  { time: '00:00', latency: 45 },
  { time: '04:00', latency: 38 },
  { time: '08:00', latency: 52 },
  { time: '12:00', latency: 89 },
  { time: '16:00', latency: 65 },
  { time: '20:00', latency: 48 },
  { time: 'Now', latency: 45 },
];

const requestVolume = [
  { time: '00:00', requests: 120 },
  { time: '04:00', requests: 85 },
  { time: '08:00', requests: 340 },
  { time: '12:00', requests: 520 },
  { time: '16:00', requests: 450 },
  { time: '20:00', requests: 280 },
  { time: 'Now', requests: 180 },
];

const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '12:45:23.456', level: 'INFO', source: 'API', message: 'Order ORD-4523 completed successfully' },
  { id: '2', timestamp: '12:44:01.234', level: 'INFO', source: 'Payment', message: 'Payment processed for user john@example.com' },
  { id: '3', timestamp: '12:43:55.789', level: 'WARN', source: 'API', message: 'High API latency detected (89ms)', details: 'Endpoint: /api/orders, Duration: 89ms' },
  { id: '4', timestamp: '12:42:30.123', level: 'INFO', source: 'QA', message: 'QA review approved for task #4521' },
  { id: '5', timestamp: '12:41:15.456', level: 'ERROR', source: 'Database', message: 'Connection pool exhausted', details: 'Active connections: 100/100, Wait time: 5.2s' },
  { id: '6', timestamp: '12:40:00.000', level: 'INFO', source: 'Auth', message: 'User login: sarah@example.com' },
  { id: '7', timestamp: '12:38:45.678', level: 'DEBUG', source: 'Cache', message: 'Cache invalidated for key: user_preferences_123' },
  { id: '8', timestamp: '12:35:22.111', level: 'WARN', source: 'Storage', message: 'Storage usage at 85%', details: 'Used: 425GB / 500GB' },
];

const mockBackups: BackupRecord[] = [
  { id: '1', name: 'backup-2024-01-15-06-00', size: '245 MB', createdAt: '2024-01-15 06:00', status: 'SUCCESS', type: 'AUTOMATIC' },
  { id: '2', name: 'backup-2024-01-14-06-00', size: '242 MB', createdAt: '2024-01-14 06:00', status: 'SUCCESS', type: 'AUTOMATIC' },
  { id: '3', name: 'manual-backup-jan13', size: '238 MB', createdAt: '2024-01-13 14:30', status: 'SUCCESS', type: 'MANUAL' },
  { id: '4', name: 'backup-2024-01-13-06-00', size: '235 MB', createdAt: '2024-01-13 06:00', status: 'SUCCESS', type: 'AUTOMATIC' },
];

const chartConfig: ChartConfig = {
  latency: { label: 'Latency', color: '#10b981' },
  requests: { label: 'Requests', color: '#06b6d4' },
};

// System Health Mock Data
const healthMetrics = [
  { name: 'Primary Server', status: 'healthy', uptime: '99.99%', lastCheck: '2 min ago', responseTime: '12ms' },
  { name: 'Secondary Server', status: 'healthy', uptime: '99.95%', lastCheck: '2 min ago', responseTime: '18ms' },
  { name: 'Load Balancer', status: 'healthy', uptime: '100%', lastCheck: '1 min ago', responseTime: '5ms' },
];

const dbConnections = [
  { name: 'Primary Database', type: 'PostgreSQL', status: 'connected', connections: 45, maxConnections: 100, latency: '3ms' },
  { name: 'Replica Database', type: 'PostgreSQL', status: 'connected', connections: 23, maxConnections: 50, latency: '8ms' },
  { name: 'Redis Cache', type: 'Redis', status: 'connected', connections: 12, maxConnections: 50, latency: '1ms' },
];

const cacheMetrics = {
  hitRate: 94.5,
  missRate: 5.5,
  totalKeys: 12453,
  memoryUsage: '2.4 GB',
  evictions: 234,
  uptime: '14d 6h',
};

const apiResponseTimes = [
  { endpoint: '/api/auth', avgTime: 45, p95: 78, p99: 120, requests: 12450 },
  { endpoint: '/api/orders', avgTime: 89, p95: 145, p99: 210, requests: 8920 },
  { endpoint: '/api/users', avgTime: 32, p95: 56, p99: 89, requests: 6780 },
  { endpoint: '/api/upload', avgTime: 234, p95: 450, p99: 780, requests: 2340 },
  { endpoint: '/api/search', avgTime: 156, p95: 280, p99: 420, requests: 4560 },
];

const errorRateData = [
  { time: '00:00', rate: 0.2, errors: 12 },
  { time: '04:00', rate: 0.1, errors: 5 },
  { time: '08:00', rate: 0.4, errors: 28 },
  { time: '12:00', rate: 1.2, errors: 89 },
  { time: '16:00', rate: 0.8, errors: 56 },
  { time: '20:00', rate: 0.3, errors: 18 },
  { time: 'Now', rate: 0.5, errors: 32 },
];

// Config Manager Mock Data
const envVariables = [
  { key: 'DATABASE_URL', value: 'postgresql://user:****@db.example.com:5432/production', masked: true, category: 'Database' },
  { key: 'REDIS_URL', value: 'redis://****@cache.example.com:6379', masked: true, category: 'Database' },
  { key: 'JWT_SECRET', value: '****hidden****', masked: true, category: 'Security' },
  { key: 'API_KEY_STRIPE', value: 'sk_live_****', masked: true, category: 'Payment' },
  { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.clippingbd.com', masked: false, category: 'Public' },
  { key: 'NEXT_PUBLIC_APP_NAME', value: 'ClippingPath & Website Services Studio', masked: false, category: 'Public' },
  { key: 'SMTP_HOST', value: 'smtp.sendgrid.net', masked: false, category: 'Email' },
  { key: 'SMTP_PORT', value: '587', masked: false, category: 'Email' },
  { key: 'AWS_ACCESS_KEY', value: 'AKIA****', masked: true, category: 'Storage' },
  { key: 'AWS_S3_BUCKET', value: 'clippingbd-uploads', masked: false, category: 'Storage' },
];

const featureFlags = [
  { id: '1', name: 'New Dashboard UI', enabled: true, description: 'Enable the redesigned dashboard interface', rollout: 100, created: '2024-01-10' },
  { id: '2', name: 'Real-time Notifications', enabled: true, description: 'WebSocket-based real-time notifications', rollout: 75, created: '2024-01-08' },
  { id: '3', name: 'Advanced Analytics', enabled: false, description: 'Enhanced analytics with custom reports', rollout: 0, created: '2024-01-12' },
  { id: '4', name: 'Bulk Export', enabled: true, description: 'Allow bulk export of orders and files', rollout: 100, created: '2024-01-05' },
  { id: '5', name: 'AI Image Enhancement', enabled: false, description: 'AI-powered automatic image enhancement', rollout: 0, created: '2024-01-14' },
  { id: '6', name: 'Beta API v2', enabled: true, description: 'New API version with improved performance', rollout: 25, created: '2024-01-11' },
];

const serviceConfigs = [
  { name: 'Payment Gateway', service: 'Stripe', status: 'active', lastSync: '5 min ago', config: { webhookUrl: '/api/webhooks/stripe', timeout: '30s' } },
  { name: 'Email Service', service: 'SendGrid', status: 'active', lastSync: '1 min ago', config: { templateId: 'd-xxxxx', batchSize: 100 } },
  { name: 'File Storage', service: 'AWS S3', status: 'active', lastSync: '2 min ago', config: { region: 'us-east-1', maxFileSize: '50MB' } },
  { name: 'CDN', service: 'Cloudflare', status: 'active', lastSync: '10 min ago', config: { cacheTTL: 3600, compression: true } },
  { name: 'Monitoring', service: 'Sentry', status: 'active', lastSync: '1 min ago', config: { environment: 'production', sampleRate: 0.1 } },
];

// API Docs Mock Data
const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/auth/session',
    description: 'Get current user session',
    auth: true,
    rateLimit: '100/minute',
    request: '{ "include": "profile" }',
    response: '{ "user": { "id": "...", "email": "..." } }'
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate user and create session',
    auth: false,
    rateLimit: '10/minute',
    request: '{ "email": "user@example.com", "password": "..." }',
    response: '{ "token": "...", "user": { ... } }'
  },
  {
    method: 'GET',
    path: '/api/orders',
    description: 'List all orders with pagination',
    auth: true,
    rateLimit: '60/minute',
    request: '{ "page": 1, "limit": 20, "status": "pending" }',
    response: '{ "orders": [...], "total": 100, "pages": 5 }'
  },
  {
    method: 'POST',
    path: '/api/orders',
    description: 'Create a new order',
    auth: true,
    rateLimit: '30/minute',
    request: '{ "service": "clipping", "files": [...], "priority": "high" }',
    response: '{ "id": "...", "status": "pending", "created": "..." }'
  },
  {
    method: 'GET',
    path: '/api/users/:id',
    description: 'Get user details by ID',
    auth: true,
    rateLimit: '100/minute',
    request: '{ }',
    response: '{ "user": { "id": "...", "name": "...", "role": "..." } }'
  },
  {
    method: 'PUT',
    path: '/api/users/:id',
    description: 'Update user profile',
    auth: true,
    rateLimit: '30/minute',
    request: '{ "name": "New Name", "avatar": "..." }',
    response: '{ "success": true, "user": { ... } }'
  },
  {
    method: 'POST',
    path: '/api/upload',
    description: 'Upload files to storage',
    auth: true,
    rateLimit: '20/minute',
    request: 'multipart/form-data',
    response: '{ "files": [{ "url": "...", "key": "..." }] }'
  },
  {
    method: 'GET',
    path: '/api/health',
    description: 'System health check endpoint',
    auth: false,
    rateLimit: 'unlimited',
    request: '{ }',
    response: '{ "status": "ok", "version": "1.0.0" }'
  },
];

const authInfo = {
  type: 'Bearer Token (JWT)',
  header: 'Authorization: Bearer <token>',
  tokenExpiry: '24 hours',
  refreshEnabled: true,
  scopes: ['read', 'write', 'admin'],
};

const rateLimitTiers = [
  { tier: 'Free', limit: '100 requests/hour', burst: 20 },
  { tier: 'Pro', limit: '1,000 requests/hour', burst: 100 },
  { tier: 'Enterprise', limit: '10,000 requests/hour', burst: 500 },
  { tier: 'Unlimited', limit: 'Contact sales', burst: 'Custom' },
];

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
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            hasAccess ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <Lock className="w-3 h-3" />
            {hasAccess ? 'Developer Access' : 'Restricted'}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Required: {requiredRole} | Your role: {currentRole}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Status Dot Component
function StatusDot({ status }: { status: 'good' | 'warning' | 'critical' }) {
  const colors = {
    good: 'bg-emerald-400',
    warning: 'bg-amber-400',
    critical: 'bg-red-400 animate-pulse',
  };
  
  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]} shadow-lg`}
      style={{ boxShadow: status === 'good' ? '0 0 8px #10b981' : status === 'warning' ? '0 0 8px #f59e0b' : '0 0 8px #ef4444' }}
    />
  );
}

// Log Level Badge
function LogLevelBadge({ level }: { level: LogEntry['level'] }) {
  const styles = {
    INFO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    WARN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
    DEBUG: 'bg-slate-500/20 text-muted-foreground border-slate-500/30',
  };
  
  return <Badge className={`text-xs font-mono ${styles[level]}`}>{level}</Badge>;
}

// System Health Component
export function SystemHealth() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const { user } = useAppStore();

  // Fetch statistics from API for system overview
  const { data: statsData, loading, refetch } = useApi<{
    stats: {
      totalUsers: number;
      totalOrders: number;
      totalRevenue: number;
      activeOrders: number;
      pendingTasks: number;
      activeEditors: number;
    };
  }>({ url: '/api/statistics', params: { scope: 'global' } });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'text-emerald-400';
      case 'degraded':
        return 'text-amber-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'bg-emerald-500/30 dark:bg-emerald-500/20';
      case 'degraded':
        return 'bg-amber-500/20';
      case 'down':
        return 'bg-red-500/20';
      default:
        return 'bg-slate-500/20';
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">System Health</h1>
            <p className="text-muted-foreground">Real-time infrastructure monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="DEVELOPER" currentRole={user?.role || 'GUEST'} />
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              All Systems Operational
            </Badge>
          </div>
        </div>

        {/* Server Status */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            Server Status
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {healthMetrics.map((server, idx) => (
              <motion.div
                key={server.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => setSelectedServer(server.name)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{server.name}</span>
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${getStatusBg(server.status)}`}>
                        <div className={`w-2 h-2 rounded-full ${server.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span className={`text-xs ${getStatusColor(server.status)}`}>{server.status}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Uptime</p>
                        <p className="font-medium">{server.uptime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Response</p>
                        <p className="font-medium">{server.responseTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Last Check</p>
                        <p className="font-medium">{server.lastCheck}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Database & Cache Status */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Database Connections */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5 text-emerald-400" />
                Database Connections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dbConnections.map((db) => (
                <div key={db.name} className="p-3 rounded-lg bg-muted/30 dark:bg-white/5 hover:bg-accent dark:hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{db.name}</span>
                      <Badge variant="outline" className="text-xs">{db.type}</Badge>
                    </div>
                    <StatusDot status="good" />
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Connections</span>
                    <span>{db.connections}/{db.maxConnections}</span>
                  </div>
                  <Progress value={(db.connections / db.maxConnections) * 100} className="h-1.5" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Latency: {db.latency}</span>
                    <span className="text-emerald-400">{((db.connections / db.maxConnections) * 100).toFixed(0)}% used</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cache Metrics */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-amber-400" />
                Cache Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 rounded-lg bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10">
                  <p className="text-3xl font-bold text-emerald-400">{cacheMetrics.hitRate}%</p>
                  <p className="text-sm text-muted-foreground">Hit Rate</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/10">
                  <p className="text-3xl font-bold text-red-400">{cacheMetrics.missRate}%</p>
                  <p className="text-sm text-muted-foreground">Miss Rate</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Keys</span>
                  <span className="font-medium">{cacheMetrics.totalKeys.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Memory Usage</span>
                  <span className="font-medium">{cacheMetrics.memoryUsage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Evictions</span>
                  <span className="font-medium">{cacheMetrics.evictions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-medium">{cacheMetrics.uptime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Response Times */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-cyan-400" />
              API Response Times
            </CardTitle>
            <CardDescription>Performance metrics for key endpoints</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              <table className="w-full">
                <thead className="sticky top-0 bg-card/95 backdrop-blur">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Endpoint</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Avg Time</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">P95</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">P99</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {apiResponseTimes.map((api, idx) => (
                    <motion.tr
                      key={api.endpoint}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/30 dark:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <code className="text-sm text-cyan-400">{api.endpoint}</code>
                      </td>
                      <td className="p-4 text-right">
                        <span className={api.avgTime < 100 ? 'text-emerald-400' : api.avgTime < 200 ? 'text-amber-400' : 'text-red-400'}>
                          {api.avgTime}ms
                        </span>
                      </td>
                      <td className="p-4 text-right text-foreground/80">{api.p95}ms</td>
                      <td className="p-4 text-right text-foreground/80">{api.p99}ms</td>
                      <td className="p-4 text-right text-foreground/80">{api.requests.toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Error Rate Tracking */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Error Rate Tracking
            </CardTitle>
            <CardDescription>System error rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={errorRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
              </LineChart>
            </ChartContainer>
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">0.5%</p>
                <p className="text-xs text-muted-foreground">Current Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">32</p>
                <p className="text-xs text-muted-foreground">Errors Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">156</p>
                <p className="text-xs text-muted-foreground">Errors This Week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">-12%</p>
                <p className="text-xs text-muted-foreground">vs Last Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Config Manager Component
export function ConfigManager() {
  const [activeTab, setActiveTab] = useState('env');
  const [showHidden, setShowHidden] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [flags, setFlags] = useState(featureFlags);
  const { user } = useAppStore();

  const toggleShowHidden = (key: string) => {
    setShowHidden(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleExportConfig = () => {
    const config = { envVariables, featureFlags: flags, serviceConfigs };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clippingbd-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const maskedValue = (value: string, key: string) => {
    if (!showHidden[key] && value.includes('****')) {
      return value;
    }
    if (!showHidden[key] && (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD'))) {
      return '****hidden****';
    }
    return value;
  };

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Config Manager</h1>
            <p className="text-muted-foreground">System configuration and feature flags</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="DEVELOPER" currentRole={user?.role || 'GUEST'} />
            <Button variant="outline" className="border-border">
              <Import className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={handleExportConfig} className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Download className="w-4 h-4 mr-2" />
              Export Config
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="env" className="data-[state=active]:bg-white/10">
              <Key className="w-4 h-4 mr-2" />
              Environment
            </TabsTrigger>
            <TabsTrigger value="flags" className="data-[state=active]:bg-white/10">
              <ToggleLeft className="w-4 h-4 mr-2" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-white/10">
              <Layers className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
          </TabsList>

          {/* Environment Variables Tab */}
          <TabsContent value="env">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  Environment Variables
                </CardTitle>
                <CardDescription>
                  Manage application environment settings. Sensitive values are masked by default.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[500px]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card/95 backdrop-blur">
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Variable</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Value</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {envVariables.map((env, idx) => (
                        <motion.tr
                          key={env.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b border-border/50 hover:bg-muted/30 dark:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <code className="text-sm text-cyan-400">{env.key}</code>
                            {env.masked && (
                              <Badge variant="outline" className="ml-2 text-xs text-amber-400 border-amber-500/30">Sensitive</Badge>
                            )}
                          </td>
                          <td className="p-4">
                            {editingKey === env.key ? (
                              <Input
                                defaultValue={env.value}
                                className="font-mono text-sm bg-muted/30 dark:bg-white/5 border-border h-8"
                              />
                            ) : (
                              <code className="text-sm text-foreground/80">
                                {maskedValue(env.value, env.key)}
                              </code>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs">{env.category}</Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {env.masked && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => toggleShowHidden(env.key)}>
                                        {showHidden[env.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{showHidden[env.key] ? 'Hide' : 'Show'}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingKey(editingKey === env.key ? null : env.key)}>
                                      <Edit3 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      try {
                                        if (navigator.clipboard && window.isSecureContext) {
                                          navigator.clipboard.writeText(env.value);
                                        } else {
                                          // Fallback: create temporary textarea
                                          const textarea = document.createElement('textarea');
                                          textarea.value = env.value;
                                          textarea.style.position = 'fixed';
                                          textarea.style.opacity = '0';
                                          document.body.appendChild(textarea);
                                          textarea.select();
                                          document.execCommand('copy');
                                          document.body.removeChild(textarea);
                                        }
                                      } catch (err) {
                                        console.warn('Clipboard not available:', err);
                                      }
                                    }}>
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="flags">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ToggleRight className="w-5 h-5 text-cyan-400" />
                      Feature Flags
                    </CardTitle>
                    <CardDescription>Toggle features on/off without deploying</CardDescription>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600">
                    <Plus className="w-4 h-4 mr-2" />
                    New Flag
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {flags.map((flag, idx) => (
                  <motion.div
                    key={flag.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-lg border transition-all ${
                      flag.enabled
                        ? 'bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10 border-emerald-500/50'
                        : 'bg-muted/30 dark:bg-white/5 border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => toggleFlag(flag.id)}
                        />
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {flag.name}
                            {flag.enabled ? (
                              <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 text-xs">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Disabled</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{flag.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">Rollout:</span>
                          <span className={`font-medium ${flag.rollout === 100 ? 'text-emerald-400' : flag.rollout > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                            {flag.rollout}%
                          </span>
                        </div>
                        <Progress value={flag.rollout} className="w-24 h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Created: {flag.created}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Service Configuration
                </CardTitle>
                <CardDescription>Connected services and integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceConfigs.map((service, idx) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 dark:bg-white/5 hover:bg-accent dark:hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">via {service.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400">{service.status}</Badge>
                        <span className="text-xs text-muted-foreground">Last sync: {service.lastSync}</span>
                      </div>
                    </div>
                    <Separator className="mb-3" />
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      {Object.entries(service.config).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/30 dark:bg-white/5">
                          <span className="text-muted-foreground">{key}:</span>
                          <code className="text-cyan-400">{String(value)}</code>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="outline" size="sm" className="border-border">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm" className="border-border">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Sync
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// API Docs Component
export function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<typeof apiEndpoints[0] | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAppStore();

  const filteredEndpoints = apiEndpoints.filter(ep => {
    const matchesMethod = filterMethod === 'all' || ep.method === filterMethod;
    const matchesSearch = ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ep.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'POST': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'PUT': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PATCH': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-muted-foreground border-slate-500/30';
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">API Documentation</h1>
            <p className="text-muted-foreground">Interactive API reference for ClippingPath & Website Services Studio</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="DEVELOPER" currentRole={user?.role || 'GUEST'} />
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-2">
              <Code className="w-4 h-4 mr-2" />
              v1.0.0
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Endpoint List */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    Endpoints
                  </CardTitle>
                  <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search endpoints..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-muted/30 dark:bg-white/5 border-border h-9"
                      />
                    </div>
                    <Select value={filterMethod} onValueChange={setFilterMethod}>
                      <SelectTrigger className="w-24 bg-muted/30 dark:bg-white/5 border-border h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[600px]">
                  <div className="divide-y divide-white/5">
                    {filteredEndpoints.map((endpoint, idx) => (
                      <motion.div
                        key={endpoint.path}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedEndpoint?.path === endpoint.path
                            ? 'bg-cyan-500/10'
                            : 'hover:bg-muted/30 dark:bg-white/5'
                        }`}
                        onClick={() => setSelectedEndpoint(endpoint)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`font-mono text-xs ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm text-cyan-400">{endpoint.path}</code>
                          {endpoint.auth && (
                            <Lock className="w-3 h-3 text-amber-400" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground ml-16">{endpoint.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Endpoint Details */}
          <div className="space-y-6">
            {selectedEndpoint ? (
              <>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Endpoint Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`font-mono ${getMethodColor(selectedEndpoint.method)}`}>
                          {selectedEndpoint.method}
                        </Badge>
                        <code className="text-lg text-cyan-400">{selectedEndpoint.path}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedEndpoint.description}</p>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Authentication</span>
                        {selectedEndpoint.auth ? (
                          <Badge className="bg-amber-500/20 text-amber-400">Required</Badge>
                        ) : (
                          <Badge variant="outline">Not Required</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rate Limit</span>
                        <span className="text-sm">{selectedEndpoint.rateLimit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Code className="w-4 h-4 text-emerald-400" />
                      Request Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-3 rounded-lg bg-card/50 text-xs overflow-x-auto">
                      <code className="text-cyan-400">{selectedEndpoint.request}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Response Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-3 rounded-lg bg-card/50 text-xs overflow-x-auto">
                      <code className="text-emerald-400">{selectedEndpoint.response}</code>
                    </pre>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select an endpoint to view details</p>
                </CardContent>
              </Card>
            )}

            {/* Authentication Info */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-sm font-medium">{authInfo.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Header Format</p>
                  <code className="text-xs text-cyan-400">{authInfo.header}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Token Expiry</span>
                  <span className="text-sm">{authInfo.tokenExpiry}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Refresh Enabled</span>
                  <Badge className={authInfo.refreshEnabled ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : ''}>
                    {authInfo.refreshEnabled ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Available Scopes</p>
                  <div className="flex flex-wrap gap-1">
                    {authInfo.scopes.map(scope => (
                      <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Rate Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rateLimitTiers.map(tier => (
                  <div key={tier.tier} className="flex items-center justify-between p-2 rounded bg-muted/30 dark:bg-white/5">
                    <span className="text-sm font-medium">{tier.tier}</span>
                    <div className="text-right">
                      <p className="text-xs text-cyan-400">{tier.limit}</p>
                      <p className="text-xs text-muted-foreground">Burst: {tier.burst}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dev Console Component
export function DevConsole() {
  const [isLive, setIsLive] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const { user } = useAppStore();

  // Simulate real-time log updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        level: ['INFO', 'INFO', 'INFO', 'WARN', 'DEBUG'][Math.floor(Math.random() * 5)] as LogEntry['level'],
        source: ['API', 'Database', 'Cache', 'Auth', 'Payment'][Math.floor(Math.random() * 5)],
        message: `Random system event ${Math.floor(Math.random() * 1000)}`,
      };
      setLogs(prev => [newLog, ...prev.slice(0, 99)]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLive]);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSource = filterSource === 'all' || log.source === filterSource;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSource && matchesSearch;
  });

  const systemMetrics: SystemMetric[] = [
    { label: 'API Latency', value: '45ms', status: 'good', trend: 'stable', icon: Wifi },
    { label: 'CPU Usage', value: '32%', status: 'good', trend: 'down', change: -5, icon: Cpu },
    { label: 'Memory', value: '4.2GB', status: 'good', trend: 'stable', icon: HardDrive },
    { label: 'Database', value: 'Connected', status: 'good', icon: Database },
    { label: 'Storage', value: '85%', status: 'warning', trend: 'up', change: 2, icon: Archive },
    { label: 'Uptime', value: '99.9%', status: 'good', icon: Activity },
  ];

  const errorCount = logs.filter(l => l.level === 'ERROR').length;
  const warnCount = logs.filter(l => l.level === 'WARN').length;

  const clearLogs = () => setLogs([]);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">Dev Console</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isLive ? 'bg-emerald-500/30 dark:bg-emerald-500/20' : 'bg-slate-500/20'}`}>
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs">{isLive ? 'Live' : 'Paused'}</span>
              </div>
            </div>
            <p className="text-muted-foreground">System health and monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="DEVELOPER" currentRole={user?.role || 'GUEST'} />
            <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              All Systems Operational
            </Badge>
          </div>
        </div>

        {/* System Health Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {systemMetrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="glass-card hover:border-emerald-500 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-4 h-4 text-muted-foreground" />
                    <StatusDot status={metric.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">{metric.value}</p>
                    {metric.trend && (
                      <div className={`flex items-center gap-1 text-xs ${
                        metric.trend === 'up' ? 'text-amber-400' : 
                        metric.trend === 'down' ? 'text-emerald-400' : 'text-muted-foreground'
                      }`}>
                        {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                         metric.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : 
                         <Minus className="w-3 h-3" />}
                        {metric.change && `${metric.change > 0 ? '+' : ''}${metric.change}%`}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* API Latency Chart */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-emerald-400" />
                API Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48">
                <AreaChart data={latencyData}>
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="latency" stroke="#10b981" fill="url(#latencyGradient)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-muted-foreground">Avg: 54ms</span>
                <span className="text-emerald-400">Within normal range</span>
              </div>
            </CardContent>
          </Card>

          {/* Request Volume Chart */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-cyan-400" />
                Request Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48">
                <AreaChart data={requestVolume}>
                  <defs>
                    <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="requests" stroke="#06b6d4" fill="url(#requestsGradient)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-muted-foreground">Total: 1,975 requests</span>
                <span className="text-cyan-400">Peak: 520 at 12:00</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                System Logs
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Counts */}
                <div className="flex items-center gap-4 mr-4">
                  <div className="flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm">{errorCount} Errors</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">{warnCount} Warnings</span>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-40 bg-muted/30 dark:bg-white/5 border-border h-8"
                  />
                </div>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-24 bg-muted/30 dark:bg-white/5 border-border h-8">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARN">Warn</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="DEBUG">Debug</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Controls */}
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsLive(!isLive)}
                          className={isLive ? 'text-emerald-400' : 'text-muted-foreground'}
                        >
                          {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isLive ? 'Pause' : 'Resume'}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={clearLogs}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear Logs</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="font-mono text-sm p-4">
                <AnimatePresence initial={false}>
                  {filteredLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 p-2 rounded hover:bg-muted/30 dark:bg-white/5 group"
                    >
                      <span className="text-muted-foreground text-xs min-w-[90px]">{log.timestamp}</span>
                      <LogLevelBadge level={log.level} />
                      <span className="text-cyan-400 text-xs min-w-[70px]">[{log.source}]</span>
                      <span className="text-foreground/80 flex-1">{log.message}</span>
                      {log.details && (
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-6">
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Clear Cache', icon: RefreshCw, color: 'text-cyan-400' },
            { label: 'Restart Services', icon: RotateCcw, color: 'text-amber-400' },
            { label: 'View Errors', icon: Bug, color: 'text-red-400' },
            { label: 'Download Logs', icon: Download, color: 'text-emerald-400' },
          ].map((action) => (
            <Button key={action.label} variant="outline" className="h-16 border-border hover:bg-muted/30 dark:bg-white/5">
              <action.icon className={`w-5 h-5 mr-3 ${action.color}`} />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Disaster Recovery Component
export function DisasterRecovery() {
  const [backups, setBackups] = useState<BackupRecord[]>(mockBackups);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const { user } = useAppStore();

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    const newBackup: BackupRecord = {
      id: Date.now().toString(),
      name: `manual-backup-${new Date().toISOString().split('T')[0]}`,
      size: '248 MB',
      createdAt: new Date().toLocaleString(),
      status: 'SUCCESS',
      type: 'MANUAL',
    };
    setBackups(prev => [newBackup, ...prev]);
    setIsCreatingBackup(false);
  };

  const getStatusBadge = (status: BackupRecord['status']) => {
    const styles = {
      SUCCESS: 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
      IN_PROGRESS: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type: BackupRecord['type']) => {
    const styles = {
      AUTOMATIC: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      MANUAL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return <Badge variant="outline" className={styles[type]}>{type}</Badge>;
  };

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Disaster Recovery</h1>
            <p className="text-muted-foreground">Backup and restore system state</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="DEVELOPER" currentRole={user?.role || 'GUEST'} />
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Database className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
              <p className="text-2xl font-bold">{backups.length}</p>
              <p className="text-sm text-muted-foreground">Total Backups</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Shield className="w-10 h-10 mx-auto mb-3 text-cyan-400" />
              <p className="text-2xl font-bold">99.9%</p>
              <p className="text-sm text-muted-foreground">Recovery Success Rate</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Clock className="w-10 h-10 mx-auto mb-3 text-amber-400" />
              <p className="text-2xl font-bold">6h</p>
              <p className="text-sm text-muted-foreground">Since Last Backup</p>
            </CardContent>
          </Card>
        </div>

        {/* Backup/Restore Actions */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card border-emerald-500/50 hover:border-emerald-500 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/30 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Export System State</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Download complete system backup as JSON archive. Includes database, settings, and user data.
              </p>
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                <Download className="w-4 h-4 mr-2" />
                Download Backup
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-amber-500/30 hover:border-amber-500/50 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Restore System</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Restore from a previous backup file. This will overwrite current data.
              </p>
              <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Restore
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle>Restore System</DialogTitle>
                    <DialogDescription>
                      Upload a backup file to restore the system state
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="border-2 border-dashed border-border/80 rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop backup file here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports .json, .sql, .zip files
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} className="border-border">
                      Cancel
                    </Button>
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                      Start Restore
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Backup History */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-cyan-400" />
              Backup History
            </CardTitle>
            <CardDescription>Available backups for restoration</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-card/95 backdrop-blur">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Size</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup, idx) => (
                    <motion.tr
                      key={backup.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/30 dark:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileJson className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{backup.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground/80">{backup.size}</td>
                      <td className="p-4 text-sm text-muted-foreground">{backup.createdAt}</td>
                      <td className="p-4">{getTypeBadge(backup.type)}</td>
                      <td className="p-4">{getStatusBadge(backup.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Download</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedBackup(backup)}
                                  className="text-amber-400"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Restore</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-400">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Warning Banner */}
        <Card className="glass-card border-red-500/30 bg-red-500/5 mt-6">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Critical Operation Warning</h3>
              <p className="text-sm text-muted-foreground">
                Restoring from a backup will <strong className="text-foreground">overwrite all current data</strong>. 
                Ensure you have a recent backup before proceeding. This action cannot be undone and may result 
                in data loss if not performed correctly.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Button variant="outline" size="sm" className="border-border">
                  <FileCode className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
                <Button variant="outline" size="sm" className="border-border">
                  <Shield className="w-4 h-4 mr-2" />
                  Safety Guidelines
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto Backup Settings */}
        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              Automatic Backup Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
              <div>
                <p className="font-medium">Enable Auto Backup</p>
                <p className="text-sm text-muted-foreground">Automatically create backups daily</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Retention Period</Label>
                <Select defaultValue="30">
                  <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
              <div>
                <p className="font-medium">Backup Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts when backups complete</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dev Pages Router Component
export function DevPages() {
  const { currentPage } = useAppStore();

  // Route to the appropriate dev component based on current path
  if (currentPage.startsWith('/dev/health')) {
    return <div className="pt-16"><SystemHealth /></div>;
  }
  
  if (currentPage.startsWith('/dev/config')) {
    return <div className="pt-16"><ConfigManager /></div>;
  }
  
  if (currentPage.startsWith('/dev/docs') || currentPage.startsWith('/dev/api')) {
    return <div className="pt-16"><ApiDocs /></div>;
  }
  
  if (currentPage.startsWith('/dev/recovery') || currentPage.startsWith('/dev/backup')) {
    return <div className="pt-16"><DisasterRecovery /></div>;
  }
  
  if (currentPage.startsWith('/dev/console') || currentPage.startsWith('/system') || currentPage.startsWith('/logs')) {
    return <div className="pt-16"><DevConsole /></div>;
  }
  
  if (currentPage.startsWith('/dev')) {
    return <div className="pt-16"><DevConsole /></div>;
  }
  
  // Default to console
  return <div className="pt-16"><DevConsole /></div>;
}
