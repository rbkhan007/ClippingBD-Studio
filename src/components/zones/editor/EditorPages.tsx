'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutGrid, Briefcase, DollarSign, Upload, Clock, CheckCircle,
  AlertCircle, ArrowRight, Eye, Zap, Timer, TrendingUp, Wallet,
  Code, Globe, Server, Play, Pause, RotateCcw, Settings, User,
  FileCode, Terminal, ExternalLink, Copy, Check, X, Package,
  Image as ImageIcon, Video, Palette, Sparkles, Layers, Filter, RefreshCw,
  CreditCard, Calendar, BarChart3, Award, FolderOpen, Plus,
  Trash2, Edit, Save, ChevronRight, ChevronUp, ChevronDown, AlertTriangle, Info, LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlassCard, GlassCardStats, GlassCardService } from '@/components/ui/glass-card';
import { useAppStore } from '@/store/app-store';
import { useApi, apiPost } from '@/hooks/use-api';
import type { Task, Department, OrderPriority } from '@/types/database';

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

// Types
interface TaskWithOrder extends Task {
  order?: {
    title: string;
    quantity: number;
    priority: OrderPriority;
    deadline: string | null;
  };
}

interface EditorStats {
  activeTasks: number;
  todayEarnings: number;
  completedToday: number;
  avgRating: number;
  totalEarnings: number;
  pendingPayout: number;
}

// Department configuration
const DEPARTMENTS: { value: Department; label: string; icon: LucideIcon; color: string }[] = [
  { value: 'CLIPPING_PATH', label: 'Clipping Path', icon: Layers, color: 'emerald' },
  { value: 'RETOUCHING', label: 'Retouching', icon: Palette, color: 'purple' },
  { value: 'COLOR_CORRECTION', label: 'Color Correction', icon: ImageIcon, color: 'cyan' },
  { value: 'MOTION_GRAPHICS', label: 'Motion Graphics', icon: Video, color: 'amber' },
  { value: 'AI_PROCESSING', label: 'AI Processing', icon: Sparkles, color: 'rose' },
  { value: 'WEB_DEVELOPMENT', label: 'Web Development', icon: Code, color: 'blue' },
];

// Countdown Timer Hook
function useCountdown(deadline: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isOverdue: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOverdue: false,
  });

  useEffect(() => {
    if (!deadline) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const difference = deadlineTime - now;

      if (difference < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isOverdue: true });
        return;
      }

      setTimeLeft({
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isOverdue: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return timeLeft;
}

// Real-time subscription hook (demo mode - no actual subscription)
function useTaskSubscription(
  onTaskUpdate: (task: TaskWithOrder) => void,
  onTaskInsert: (task: TaskWithOrder) => void,
  onTaskDelete: (taskId: string) => void
) {
  // In demo mode, we don't have real-time subscriptions
  // This is a placeholder that does nothing
  useEffect(() => {
    // No-op for demo mode
  }, [onTaskUpdate, onTaskInsert, onTaskDelete]);
}

// Nitro Badge Component with pulse animation
function NitroBadge({ pulse = true }: { pulse?: boolean }) {
  return (
    <Badge 
      className={`bg-gradient-to-r from-red-600 to-orange-500 text-foreground text-xs font-bold ${pulse ? 'animate-pulse' : ''}`}
    >
      <Zap className="w-3 h-3 mr-1" />
      NITRO
    </Badge>
  );
}

// Timer Display Component
function TimerDisplay({ deadline, isNitro }: { deadline: string | null; isNitro?: boolean }) {
  const { hours, minutes, seconds, isOverdue } = useCountdown(deadline);
  
  const isUrgent = hours < 2 && !isOverdue;
  
  return (
    <div className={`flex items-center gap-1 font-mono text-sm ${
      isOverdue ? 'text-red-500' : 
      isUrgent || isNitro ? 'text-amber-400 animate-pulse' : 
      'text-muted-foreground'
    }`}>
      <Timer className={`w-4 h-4 ${isUrgent || isNitro ? 'animate-pulse' : ''}`} />
      <span>
        {isOverdue ? 'OVERDUE' : 
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
      </span>
    </div>
  );
}

// Mock data for development
const mockAvailableTasks: TaskWithOrder[] = [
  { 
    id: '1', 
    orderId: 'ord-1', 
    editorId: null, 
    status: 'AVAILABLE', 
    department: 'CLIPPING_PATH',
    claimedAt: null,
    submittedAt: null,
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    payoutAmount: 12.50,
    revisionCount: 0,
    revisionNotes: null,
    createdAt: new Date().toISOString(),
    order: { title: 'Product Clipping Path', quantity: 50, priority: 'EXPRESS', deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() }
  },
  { 
    id: '2', 
    orderId: 'ord-2', 
    editorId: null, 
    status: 'AVAILABLE', 
    department: 'RETOUCHING',
    claimedAt: null,
    submittedAt: null,
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    payoutAmount: 18.00,
    revisionCount: 0,
    revisionNotes: null,
    createdAt: new Date().toISOString(),
    order: { title: 'Portrait Retouching', quantity: 15, priority: 'STANDARD', deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() }
  },
  { 
    id: '3', 
    orderId: 'ord-3', 
    editorId: null, 
    status: 'AVAILABLE', 
    department: 'COLOR_CORRECTION',
    claimedAt: null,
    submittedAt: null,
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    payoutAmount: 22.00,
    revisionCount: 0,
    revisionNotes: null,
    createdAt: new Date().toISOString(),
    order: { title: 'E-commerce Color Correction', quantity: 80, priority: 'NITRO', deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() }
  },
  { 
    id: '4', 
    orderId: 'ord-4', 
    editorId: null, 
    status: 'AVAILABLE', 
    department: 'MOTION_GRAPHICS',
    claimedAt: null,
    submittedAt: null,
    deadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    payoutAmount: 45.00,
    revisionCount: 0,
    revisionNotes: null,
    createdAt: new Date().toISOString(),
    order: { title: 'Motion Graphics Intro', quantity: 1, priority: 'EXPRESS', deadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() }
  },
  { 
    id: '5', 
    orderId: 'ord-5', 
    editorId: null, 
    status: 'AVAILABLE', 
    department: 'AI_PROCESSING',
    claimedAt: null,
    submittedAt: null,
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    payoutAmount: 35.00,
    revisionCount: 0,
    revisionNotes: null,
    createdAt: new Date().toISOString(),
    order: { title: 'AI Background Generation', quantity: 25, priority: 'NITRO', deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }
  },
  { 
    id: '6', 
    orderId: 'ord-6', 
    editorId: null, 
    status: 'AVAILABLE', 
    department: 'WEB_DEVELOPMENT',
    claimedAt: null,
    submittedAt: null,
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    payoutAmount: 150.00,
    revisionCount: 0,
    revisionNotes: null,
    createdAt: new Date().toISOString(),
    order: { title: 'Landing Page Development', quantity: 1, priority: 'STANDARD', deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() }
  },
];

const mockMyTasks: TaskWithOrder[] = [
  { 
    id: 'm1', 
    orderId: 'ord-m1', 
    editorId: 'me', 
    status: 'IN_PROGRESS', 
    department: 'CLIPPING_PATH',
    claimedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    submittedAt: null,
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    payoutAmount: 15.00,
    revisionCount: 0,
    revisionNotes: null,
    createdAt: new Date().toISOString(),
    order: { title: 'Background Removal Batch', quantity: 30, priority: 'NITRO', deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }
  },
  { 
    id: 'm2', 
    orderId: 'ord-m2', 
    editorId: 'me', 
    status: 'IN_PROGRESS', 
    department: 'RETOUCHING',
    claimedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    submittedAt: null,
    deadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    payoutAmount: 20.00,
    revisionCount: 0,
    revisionNotes: null,
    createdAt: new Date().toISOString(),
    order: { title: 'Product Retouching', quantity: 20, priority: 'STANDARD', deadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() }
  },
];

// ================== EDITOR JOB BOARD ==================
export function EditorJobBoard() {
  const { user } = useAppStore();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<OrderPriority | 'ALL'>('ALL');
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');

  const handleScroll = (direction: 'top' | 'bottom') => {
    const el = document.getElementById('editor-tasks-scroll');
    if (el) {
      const viewport = el.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: direction === 'top' ? 0 : viewport.scrollHeight, behavior: 'smooth' });
      }
      setScrollDirection(direction);
    }
  };

  // Fetch tasks from API
  const { data: tasksData, loading, refetch } = useApi<{
    tasks: Array<{
      id: string;
      orderId: string;
      editorId: string | null;
      status: string;
      department: string;
      deadline: string | null;
      payoutAmount: number | null;
      createdAt: string;
      order?: {
        id: string;
        orderNumber: string;
        title: string;
        quantity: number;
        priority: string;
        deadline: string | null;
      };
    }>;
  }>({ url: '/api/tasks', params: { status: 'AVAILABLE' } });

  // Fetch statistics from API
  const { data: statsData } = useApi<{
    stats: {
      activeTasks: number;
      todayEarnings: number;
      totalEarnings: number;
      pendingPayout: number;
    };
  }>({ url: '/api/statistics' });

  const tasks = tasksData?.tasks || [];
  const isRefreshing = loading;

  const filteredTasks = tasks.filter(task => {
    const deptMatch = selectedDepartment === 'ALL' || task.department === selectedDepartment;
    const priorityMatch = selectedPriority === 'ALL' || task.order?.priority === selectedPriority;
    return deptMatch && priorityMatch && task.status === 'AVAILABLE';
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const handleClaimTask = async (taskId: string) => {
    setClaimingTaskId(taskId);
    const result = await apiPost('/api/tasks', { taskId });
    if (result.error) {
      console.error('Failed to claim task:', result.error);
    } else {
      await refetch();
    }
    setClaimingTaskId(null);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl font-bold mb-1 gradient-text">Global Job Board</h1>
            <p className="text-muted-foreground">Claim tasks across all departments</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">Your Earnings</p>
              <p className="text-2xl font-bold gradient-text">$342.50</p>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              className="border-border hover:bg-muted/30 dark:bg-white/5 hover:border-emerald-500 btn-secondary-premium"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <GlassCard variant="default" padding="md" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-2 block">Department</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedDepartment === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDepartment('ALL')}
                  className={selectedDepartment === 'ALL'
                    ? 'btn-premium'
                    : 'border-border hover:bg-muted/30 dark:bg-white/5 btn-secondary-premium'
                  }
                >
                  All
                </Button>
                {DEPARTMENTS.map((dept) => (
                  <Button
                    key={dept.value}
                    variant={selectedDepartment === dept.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDepartment(dept.value)}
                    className={selectedDepartment === dept.value
                      ? 'btn-premium'
                      : 'border-border hover:bg-muted/30 dark:bg-white/5 btn-secondary-premium'
                    }
                  >
                    <dept.icon className="w-3 h-3 mr-1" />
                    {dept.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="sm:w-48">
              <Label className="text-xs text-muted-foreground mb-2 block">Priority</Label>
              <Select value={selectedPriority} onValueChange={(v) => setSelectedPriority(v as OrderPriority | 'ALL')}>
                <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border hover:border-emerald-500">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="NITRO">🔥 Nitro</SelectItem>
                  <SelectItem value="EXPRESS">⚡ Express</SelectItem>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Stats Row */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Available Tasks"
              value={filteredTasks.length}
              icon={Briefcase}
              trend="neutral"
              className="hover:border-emerald-500"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Nitro Tasks"
              value={filteredTasks.filter(t => t.order?.priority === 'NITRO').length}
              icon={Zap}
              trend="up"
              trendValue="Priority"
              className="hover:border-red-500/30"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Total Value"
              value={`$${filteredTasks.reduce((sum, t) => sum + (t.payoutAmount || 0), 0).toFixed(2)}`}
              icon={DollarSign}
              trend="up"
              trendValue="Available"
              className="hover:border-cyan-500/30"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Your Rating"
              value="4.9 ⭐"
              icon={Award}
              trend="up"
              trendValue="Excellent"
              className="hover:border-amber-500/30"
            />
          </motion.div>
        </motion.div>

        {/* Tasks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, idx) => {
              const isNitro = task.order?.priority === 'NITRO';
              const isExpress = task.order?.priority === 'EXPRESS';
              
              return (
                <motion.div
                  key={task.id}
                  layout
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ delay: idx * 0.05 }}
                >
                  <GlassCard 
                    variant="service" 
                    padding="none"
                    className={`${isNitro ? 'border-red-500/30 nitro-glow' : isExpress ? 'border-amber-500/30' : ''} group`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="badge-premium text-xs">
                          {task.department.replace('_', ' ')}
                        </Badge>
                        {isNitro && <NitroBadge />}
                        {isExpress && !isNitro && (
                          <Badge className="badge-premium bg-amber-500/20 text-amber-400 text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            EXPRESS
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold mb-2 group-hover:text-emerald-600 dark:text-emerald-400 transition-colors gradient-text">
                        {task.order?.title || 'Untitled Task'}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center justify-between">
                          <span>Quantity</span>
                          <span className="font-medium text-white">{task.order?.quantity || 0} items</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Deadline</span>
                          <TimerDisplay deadline={task.deadline} isNitro={isNitro} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Payout</span>
                          <span className="font-bold text-emerald-400">${(task.payoutAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full btn-premium"
                        onClick={() => handleClaimTask(task.id)}
                        disabled={claimingTaskId === task.id}
                      >
                        {claimingTaskId === task.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Briefcase className="w-4 h-4 mr-2" />
                            Claim Task
                          </>
                        )}
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tasks available in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ================== EDITOR WORKSPACE ==================
export function EditorWorkspace() {
  const { user } = useAppStore();
  const [progress, setProgress] = useState<Record<string, number>>({});

  // Fetch tasks from API (only my claimed tasks)
  const { data: tasksData, loading, refetch } = useApi<{
    tasks: Array<{
      id: string;
      orderId: string;
      editorId: string | null;
      status: string;
      department: string;
      deadline: string | null;
      payoutAmount: number | null;
      claimedAt: string | null;
      createdAt: string;
      order?: {
        id: string;
        orderNumber: string;
        title: string;
        quantity: number;
        priority: string;
        deadline: string | null;
      };
    }>;
  }>({ url: '/api/tasks' });

  // Fetch statistics from API
  const { data: statsData } = useApi<{
    stats: {
      activeTasks: number;
      todayEarnings: number;
      completedToday: number;
      avgRating: number;
      totalEarnings: number;
      pendingPayout: number;
    };
  }>({ url: '/api/statistics' });

  // Filter for my in-progress tasks
  const tasks = (tasksData?.tasks || []).filter(t => 
    ['CLAIMED', 'IN_PROGRESS'].includes(t.status)
  );

  const stats = statsData?.stats || {
    activeTasks: tasks.length,
    todayEarnings: 0,
    completedToday: 0,
    avgRating: 4.9,
    totalEarnings: 0,
    pendingPayout: 0,
  };

  const handleSubmit = async (taskId: string) => {
    const result = await apiPost('/api/tasks', { taskId, action: 'submit' });
    if (!result.error) {
      await refetch();
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <motion.div 
          className="grid sm:grid-cols-4 gap-4 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Active Tasks"
              value={stats.activeTasks}
              icon={Briefcase}
              trend="neutral"
              className="hover:border-emerald-500"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Today's Earnings"
              value={`$${stats.todayEarnings.toFixed(2)}`}
              icon={DollarSign}
              trend="up"
              trendValue="Great progress"
              className="hover:border-cyan-500/30"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Completed Today"
              value={stats.completedToday}
              icon={CheckCircle}
              trend="up"
              trendValue="Keep going!"
              className="hover:border-teal-500/30"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Avg. Rating"
              value={`${stats.avgRating} ⭐`}
              icon={Award}
              trend="up"
              trendValue="Excellent"
              className="hover:border-amber-500/30"
            />
          </motion.div>
        </motion.div>

        <motion.h2 
          className="text-2xl font-bold mb-4 gradient-text"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          My Active Tasks
        </motion.h2>

        {/* Active Tasks */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, idx) => {
              const isNitro = task.order?.priority === 'NITRO';
              const taskProgress = progress[task.id] || 0;
              
              return (
                <motion.div
                  key={task.id}
                  layout
                  variants={slideInRight}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ delay: idx * 0.1 }}
                >
                  <GlassCard 
                    variant="service" 
                    padding="none"
                    className={`${isNitro ? 'border-red-500/30 nitro-glow' : ''} group`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          {isNitro && <NitroBadge />}
                          {task.order?.priority === 'EXPRESS' && !isNitro && (
                            <Badge className="badge-premium bg-amber-500/20 text-amber-400">
                              <Zap className="w-3 h-3 mr-1" />
                              EXPRESS
                            </Badge>
                          )}
                          <div>
                            <h3 className="font-semibold gradient-text">{task.order?.title || 'Task'}</h3>
                            <p className="text-xs text-muted-foreground">{task.department.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <TimerDisplay deadline={task.deadline} isNitro={isNitro} />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={taskProgress}
                              onChange={(e) => setProgress(prev => ({ ...prev, [task.id]: Number(e.target.value) }))}
                              className="w-16 h-8 text-center bg-muted/30 dark:bg-white/5 border-border hover:border-emerald-500"
                            />
                            <span className="font-medium">%</span>
                          </div>
                        </div>
                        <Progress value={taskProgress} className="h-2" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Quantity: <span className="text-foreground font-medium">{task.order?.quantity || 0}</span>
                            </span>
                            <span className="text-emerald-400 font-semibold">
                              +${(task.payoutAmount || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-border hover:border-emerald-500 btn-secondary-premium">
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                            <Button 
                              size="sm" 
                              className="btn-premium"
                              onClick={() => handleSubmit(task.id)}
                              disabled={taskProgress < 100}
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {tasks.length === 0 && (
          <GlassCard variant="default" padding="lg">
            <div className="py-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
              <p className="text-muted-foreground mb-4">No active tasks. Visit the Job Board to claim new tasks.</p>
              <Button className="btn-premium">
                <Briefcase className="w-4 h-4 mr-2" />
                Go to Job Board
              </Button>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

// ================== EDITOR WEB WORKSPACE ==================
export function EditorWebWorkspace() {
  const [activeProject, setActiveProject] = useState<{
    id: string;
    name: string;
    framework: string;
    previewUrl: string;
    files: { name: string; content: string; language: string }[];
  } | null>({
    id: 'web-1',
    name: 'Client Landing Page',
    framework: 'Next.js',
    previewUrl: 'https://preview.example.com',
    files: [
      { name: 'page.tsx', content: 'export default function Page() {\n  return <div>Hello World</div>\n}', language: 'typescript' },
      { name: 'styles.css', content: '.container { max-width: 1200px; }', language: 'css' },
    ],
  });
  
  const [selectedFile, setSelectedFile] = useState(0);
  const [code, setCode] = useState(activeProject?.files[0]?.content || '');
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard not available:', err);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Web Development Workspace</h1>
            <p className="text-muted-foreground">Build and preview web projects</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-400">
              <Code className="w-3 h-3 mr-1" />
              {activeProject?.framework || 'Next.js'}
            </Badge>
          </div>
        </div>

        {/* Project Info */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-semibold">{activeProject?.name}</h3>
                  <p className="text-sm text-muted-foreground">Project ID: {activeProject?.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-border">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open Preview
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Server className="w-4 h-4 mr-1" />
                  Deploy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Editor Area */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Code Editor */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Code Editor
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* File Tabs */}
              <div className="flex border-b border-border overflow-x-auto">
                {activeProject?.files.map((file, idx) => (
                  <button
                    key={file.name}
                    onClick={() => { setSelectedFile(idx); setCode(file.content); }}
                    className={`px-4 py-2 text-sm whitespace-nowrap ${
                      selectedFile === idx 
                        ? 'text-emerald-400 border-b-2 border-emerald-400 bg-muted/30 dark:bg-white/5' 
                        : 'text-muted-foreground hover:text-white hover:bg-muted/30 dark:bg-white/5'
                    }`}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
              
              {/* Code Area */}
              <div className="relative">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[400px] font-mono text-sm bg-card/50 border-0 rounded-none resize-none focus-visible:ring-0"
                  placeholder="// Write your code here..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Live Preview
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(!isPreviewOpen)}>
                  {isPreviewOpen ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isPreviewOpen ? (
                <div className="min-h-[400px] bg-white rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 border-b">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-muted-foreground">{activeProject?.previewUrl}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white h-full min-h-[350px]">
                    <div className="text-slate-800">
                      <h1 className="text-2xl font-bold mb-4">Preview Content</h1>
                      <p className="text-slate-600">Your rendered content will appear here.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px] flex items-center justify-center border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Preview hidden</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Terminal */}
        <Card className="glass-card mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Terminal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-card/80 rounded-lg p-4 font-mono text-sm">
              <div className="text-emerald-400">$ npm run dev</div>
              <div className="text-muted-foreground mt-1">Ready on http://localhost:3000</div>
              <div className="text-muted-foreground">Compiling...</div>
              <div className="text-emerald-400">✓ Compiled successfully!</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== EDITOR DEPLOY ==================
export function EditorDeploy() {
  const [deployments] = useState([
    { id: 'd1', name: 'Client Landing Page', status: 'SUCCESS', version: 'v1.2.0', deployedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), url: 'https://client-demo.com' },
    { id: 'd2', name: 'E-commerce Store', status: 'BUILDING', version: 'v2.0.0', deployedAt: null, url: null },
    { id: 'd3', name: 'Portfolio Site', status: 'FAILED', version: 'v1.0.0', deployedAt: null, url: null },
  ]);

  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');

  const handleScroll = (direction: 'top' | 'bottom') => {
    const el = document.getElementById('editor-tasks-scroll');
    if (el) {
      const viewport = el.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: direction === 'top' ? 0 : viewport.scrollHeight, behavior: 'smooth' });
      }
      setScrollDirection(direction);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-emerald-400';
      case 'BUILDING': return 'text-amber-400 animate-pulse';
      case 'FAILED': return 'text-red-400';
      case 'PENDING': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4" />;
      case 'BUILDING': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'FAILED': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Deployments</h1>
            <p className="text-muted-foreground">Manage your web project deployments</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
            <Server className="w-4 h-4 mr-2" />
            New Deployment
          </Button>
        </div>

        {/* Deployment Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Deployments</p>
              <p className="text-3xl font-bold">12</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-emerald-500/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-3xl font-bold text-emerald-400">10</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-red-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-3xl font-bold text-red-400">2</p>
            </CardContent>
          </Card>
        </div>

        {/* Deployment List */}
        <Card className="glass-card mb-6 relative">
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[400px]" id="editor-tasks-scroll">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Project</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Version</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Deployed</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.map((deployment) => (
                    <tr 
                      key={deployment.id} 
                      className="border-b border-border/50 hover:bg-muted/30 dark:bg-white/5 cursor-pointer"
                      onClick={() => setSelectedDeployment(deployment.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-400" />
                          <span className="font-medium">{deployment.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">{deployment.version}</Badge>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center gap-2 ${getStatusColor(deployment.status)}`}>
                          {getStatusIcon(deployment.status)}
                          <span className="capitalize text-sm">{deployment.status.toLowerCase()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {deployment.deployedAt 
                          ? new Date(deployment.deployedAt).toLocaleString() 
                          : '-'
                        }
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {deployment.status === 'SUCCESS' && deployment.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {deployment.status === 'FAILED' && (
                            <Button variant="ghost" size="sm">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
            
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('top')}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('bottom')}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Build Logs */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Build Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-card/80 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto custom-scrollbar">
              <div className="text-muted-foreground">[2024-01-15 12:45:23] Starting build...</div>
              <div className="text-muted-foreground">[2024-01-15 12:45:24] Installing dependencies...</div>
              <div className="text-emerald-400">[2024-01-15 12:45:45] ✓ Dependencies installed</div>
              <div className="text-muted-foreground">[2024-01-15 12:45:46] Building application...</div>
              <div className="text-emerald-400">[2024-01-15 12:46:02] ✓ Build completed</div>
              <div className="text-muted-foreground">[2024-01-15 12:46:03] Deploying to edge network...</div>
              <div className="text-emerald-400">[2024-01-15 12:46:15] ✓ Deployment successful</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== EDITOR UPLOAD ==================
export function EditorUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    
    // Simulate upload with progress
    for (const file of files) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [file.name]: i }));
      }
    }
    
    setUploading(false);
    setFiles([]);
    setUploadProgress({});
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Upload Deliverables</h1>
            <p className="text-muted-foreground">High-speed file upload for completed work</p>
          </div>
        </div>

        {/* Upload Area */}
        <Card className={`glass-card mb-6 ${dragActive ? 'border-emerald-500' : ''}`}>
          <CardContent className="p-8">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10' 
                  : 'border-border/80 hover:border-white/40'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*,.zip,.rar,.7z"
              />
              
              <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-emerald-400' : 'text-muted-foreground'}`} />
              
              <h3 className="text-lg font-semibold mb-2">
                {dragActive ? 'Drop files here' : 'Drag & Drop Files'}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse from your computer
              </p>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="border-border hover:bg-muted/30 dark:bg-white/5"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                Supported: Images, Videos, ZIP, RAR (Max 500MB per file)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* File Queue */}
        {files.length > 0 && (
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>File Queue ({files.length})</span>
                <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-64">
                <div className="divide-y divide-white/5">
                  {files.map((file, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted/30 dark:bg-white/5 flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-emerald-400" />
                          ) : file.type.startsWith('video/') ? (
                            <Video className="w-5 h-5 text-purple-400" />
                          ) : (
                            <Package className="w-5 h-5 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {uploading && uploadProgress[file.name] !== undefined && (
                          <div className="w-24">
                            <Progress value={uploadProgress[file.name]} className="h-2" />
                          </div>
                        )}
                        {!uploading && (
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <Button 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 h-12"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} File{files.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}

        {/* Recent Uploads */}
        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'project_final.zip', size: '45.2 MB', time: '2 hours ago', status: 'completed' },
                { name: 'product_images.zip', size: '128.5 MB', time: '5 hours ago', status: 'completed' },
                { name: 'retouched_batch.zip', size: '67.8 MB', time: 'Yesterday', status: 'completed' },
              ].map((upload, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-medium text-sm">{upload.name}</p>
                      <p className="text-xs text-muted-foreground">{upload.size} • {upload.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/50">
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== EDITOR PAYOUTS ==================
export function EditorPayouts() {
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const stats = {
    available: 342.50,
    thisMonth: 1247.00,
    pending: 85.00,
    totalLifetime: 15420.00,
  };

  const transactions = [
    { id: 't1', type: 'earning', description: 'Product Clipping Path - Batch #1234', amount: 45.00, date: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'completed' },
    { id: 't2', type: 'earning', description: 'Portrait Retouching - Order #5678', amount: 32.50, date: new Date(Date.now() - 6 * 60 * 60 * 1000), status: 'completed' },
    { id: 't3', type: 'payout', description: 'Payout to Bank Account', amount: -200.00, date: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'completed' },
    { id: 't4', type: 'earning', description: 'Color Correction - Batch #9012', amount: 28.00, date: new Date(Date.now() - 48 * 60 * 60 * 1000), status: 'completed' },
    { id: 't5', type: 'payout', description: 'Payout Requested', amount: -150.00, date: new Date(Date.now() - 72 * 60 * 60 * 1000), status: 'pending' },
  ];

  const payoutHistory = [
    { id: 'p1', amount: 200.00, status: 'COMPLETED', requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), processedAt: new Date(Date.now() - 23 * 60 * 60 * 1000) },
    { id: 'p2', amount: 150.00, status: 'PENDING', requestedAt: new Date(Date.now() - 72 * 60 * 60 * 1000), processedAt: null },
    { id: 'p3', amount: 300.00, status: 'COMPLETED', requestedAt: new Date(Date.now() - 168 * 60 * 60 * 1000), processedAt: new Date(Date.now() - 166 * 60 * 60 * 1000) },
  ];

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Earnings & Payouts</h1>
            <p className="text-muted-foreground">Track your earnings and request payouts</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card border-emerald-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-6 h-6 text-emerald-400" />
                <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400">Available</Badge>
              </div>
              <p className="text-3xl font-bold gradient-text">${stats.available.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">Ready to withdraw</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-teal-400" />
                <Badge className="bg-teal-500/20 text-teal-400">This Month</Badge>
              </div>
              <p className="text-3xl font-bold">${stats.thisMonth.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">+18% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-6 h-6 text-amber-400" />
                <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>
              </div>
              <p className="text-3xl font-bold">${stats.pending.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">Processing</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400">Lifetime</Badge>
              </div>
              <p className="text-3xl font-bold">${stats.totalLifetime.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">Total earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Payout Request */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Request Payout
            </CardTitle>
            <CardDescription>Minimum payout amount: $50.00</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground">Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="pl-8 bg-muted/30 dark:bg-white/5 border-border"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground">Payment Method</Label>
                <Select defaultValue="bank">
                  <SelectTrigger className="mt-1 bg-muted/30 dark:bg-white/5 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="wise">Wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 w-full sm:w-auto"
                  disabled={!payoutAmount || parseFloat(payoutAmount) < 50 || parseFloat(payoutAmount) > stats.available}
                >
                  Request Withdrawal
                </Button>
              </div>
            </div>
            
            {payoutAmount && parseFloat(payoutAmount) > stats.available && (
              <p className="text-red-400 text-sm mt-2">Amount exceeds available balance</p>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Transaction History */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[400px]">
                <div className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-muted/30 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'earning' ? 'bg-emerald-500/30 dark:bg-emerald-500/20' : 'bg-amber-500/20'
                          }`}>
                            {tx.type === 'earning' ? (
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <CreditCard className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.date.toLocaleDateString()} at {tx.date.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${
                          tx.amount > 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payout History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[400px]">
                <div className="divide-y divide-white/5">
                  {payoutHistory.map((payout) => (
                    <div key={payout.id} className="p-4 hover:bg-muted/30 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">${payout.amount.toFixed(2)} Payout</p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {payout.requestedAt.toLocaleDateString()}
                          </p>
                          {payout.processedAt && (
                            <p className="text-xs text-muted-foreground">
                              Processed: {payout.processedAt.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge className={
                          payout.status === 'COMPLETED' 
                            ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }>
                          {payout.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ================== EDITOR PROFILE ==================
export function EditorProfile() {
  const { user, updateUser } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Editor',
    email: user?.email || 'john@example.com',
    bio: 'Experienced photo editor specializing in e-commerce and portrait retouching.',
    skills: ['Clipping Path', 'Retouching', 'Color Correction', 'Batch Processing'],
    hourlyRate: 25,
    availability: 'full-time',
    timezone: 'UTC+6',
  });

  const [portfolioItems] = useState([
    { id: 'p1', title: 'E-commerce Product Editing', category: 'Clipping Path', image: '/images/services/image-editing.jpg' },
    { id: 'p2', title: 'Portrait Retouching', category: 'Retouching', image: '/images/services/image-editing.jpg' },
    { id: 'p3', title: 'Color Correction', category: 'Color Correction', image: '/images/services/image-editing.jpg' },
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    nitroAlerts: true,
    deadlineReminders: true,
    showOnlineStatus: true,
    publicProfile: false,
  });

  const handleSave = async () => {
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
  };

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Editor Profile</h1>
            <p className="text-muted-foreground">Manage your profile and settings</p>
          </div>
          <Button
            variant={isEditing ? 'default' : 'outline'}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={isEditing ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'border-border'}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.avatar || ''} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    {profileData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-border"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-xl font-bold bg-muted/30 dark:bg-white/5 border-border mb-2"
                  />
                ) : (
                  <h2 className="text-xl font-bold mb-1">{profileData.name}</h2>
                )}
                <p className="text-muted-foreground mb-2">{profileData.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400">
                    <Award className="w-3 h-3 mr-1" />
                    Top Editor
                  </Badge>
                  <Badge variant="outline" className="border-border/80">
                    ⭐ 4.9 Rating
                  </Badge>
                  <Badge variant="outline" className="border-border/80">
                    500+ Projects
                  </Badge>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold gradient-text">98.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/30 dark:bg-white/5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="bg-muted/30 dark:bg-white/5 border-border"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm">{profileData.bio}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="border-border/80">
                          {skill}
                        </Badge>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm" className="h-6 px-2 border-border">
                          <Plus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Work Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Hourly Rate</Label>
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={profileData.hourlyRate}
                          onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                          className="pl-8 bg-muted/30 dark:bg-white/5 border-border"
                        />
                      </div>
                    ) : (
                      <p className="text-lg font-semibold">${profileData.hourlyRate}/hr</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Availability</Label>
                    {isEditing ? (
                      <Select 
                        value={profileData.availability} 
                        onValueChange={(v) => setProfileData(prev => ({ ...prev, availability: v }))}
                      >
                        <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="weekends">Weekends Only</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="capitalize">{profileData.availability.replace('-', ' ')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Timezone</Label>
                    {isEditing ? (
                      <Select 
                        value={profileData.timezone} 
                        onValueChange={(v) => setProfileData(prev => ({ ...prev, timezone: v }))}
                      >
                        <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC-8">UTC-8 (Pacific)</SelectItem>
                          <SelectItem value="UTC-5">UTC-5 (Eastern)</SelectItem>
                          <SelectItem value="UTC+0">UTC+0 (London)</SelectItem>
                          <SelectItem value="UTC+6">UTC+6 (Dhaka)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p>{profileData.timezone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card className="glass-card mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Portfolio Items</CardTitle>
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioItems.map((item) => (
                    <div 
                      key={item.id}
                      className="group relative aspect-square rounded-lg overflow-hidden bg-muted/30 dark:bg-white/5"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 dark:text-white 30" />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <p className="font-semibold mb-1">{item.title}</p>
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-8 border-border/80">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 border-border/80">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Portfolio Item */}
                  <div className="aspect-square rounded-lg border-2 border-dashed border-border/80 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                    <div className="text-center">
                      <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Add Portfolio Item</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates for important events' },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Get push notifications on your device' },
                    { key: 'nitroAlerts', label: 'Nitro Task Alerts', description: 'Get instant alerts for high-priority tasks' },
                    { key: 'deadlineReminders', label: 'Deadline Reminders', description: 'Remind me before task deadlines' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{setting.label}</p>
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch
                        checked={settings[setting.key as keyof typeof settings]}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, [setting.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you are online' },
                    { key: 'publicProfile', label: 'Public Profile', description: 'Allow clients to view your profile' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{setting.label}</p>
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch
                        checked={settings[setting.key as keyof typeof settings]}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, [setting.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
                
                <Separator className="my-4 bg-white/10" />
                
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Danger Zone
                    </h4>
                    <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                      Deactivate Account
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

// ============================================
// EDITOR PAGES WRAPPER
// ============================================
// This wrapper component routes to the correct editor page based on the current path
export function EditorPages() {
  const { currentPage } = useAppStore();
  
  // Job Board
  if (currentPage === '/editor/board' || currentPage === '/editor') {
    return <div className="pt-16"><EditorJobBoard /></div>;
  }
  
  // Workspace
  if (currentPage === '/editor/workspace') {
    return <div className="pt-16"><EditorWorkspace /></div>;
  }
  
  // Web Workspace
  if (currentPage === '/editor/web') {
    return <div className="pt-16"><EditorWebWorkspace /></div>;
  }
  
  // Deploy
  if (currentPage === '/editor/deploy') {
    return <div className="pt-16"><EditorDeploy /></div>;
  }
  
  // Upload
  if (currentPage === '/editor/upload') {
    return <div className="pt-16"><EditorUpload /></div>;
  }
  
  // Payouts
  if (currentPage === '/editor/payouts') {
    return <div className="pt-16"><EditorPayouts /></div>;
  }
  
  // Profile
  if (currentPage === '/editor/profile') {
    return <div className="pt-16"><EditorProfile /></div>;
  }
  
  // Default to job board
  return <div className="pt-16"><EditorJobBoard /></div>;
}
