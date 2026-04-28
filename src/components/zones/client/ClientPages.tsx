'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PlusCircle, Folder, CreditCard, HeadphonesIcon,
  ArrowRight, Clock, CheckCircle, AlertCircle, DollarSign, TrendingUp,
  FileText, Upload, Zap, Bell, ChevronRight, Calendar, MessageSquare,
  Settings, User, Image as ImageIcon, Video, Sparkles, Download,
  Trash2, Eye, Send, Paperclip, MoreVertical, Search, Filter,
  ChevronDown, ChevronUp, X, Plus, Wallet, ArrowUpRight, ArrowDownLeft,
  RefreshCw, ExternalLink, Copy, Check, Edit2, Mail, Phone,
  MapPin, Building, Globe, Shield, CreditCard as CardIcon, History,
  Inbox, Users, File, FolderOpen, HardDrive, Cloud, Share2,
  Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard, GlassCardStats } from '@/components/ui/glass-card';
import { useAppStore } from '@/store/app-store';
import { useNavigation } from '@/hooks/use-navigation';
import { useChat } from '@/hooks/realtime/use-chat';
import { useApi } from '@/hooks/use-api';
import { useClientOrders, useClientTransactions, useClientTickets, useClientMessages, useClientAssets, useServices } from '@/hooks/use-api-data';
import type { Order, OrderStatus, OrderPriority, ServiceType, Transaction, SupportTicket, Asset, ChatRoom, ChatMessage } from '@/types/database';

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

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

// ============================================
// UTILITY FUNCTIONS & HELPERS
// ============================================

const getStatusColor = (status: OrderStatus | string) => {
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
      return 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    case 'IN_PROGRESS':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'QA':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'REVISION':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'PENDING':
    case 'DRAFT':
      return 'bg-slate-500/20 text-muted-foreground border-slate-500/30';
    case 'CANCELLED':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-muted-foreground border-slate-500/30';
  }
};

const getPriorityBadge = (priority: OrderPriority | string) => {
  switch (priority) {
    case 'NITRO':
      return (
        <Badge className="nitro-glow bg-gradient-to-r from-red-600 to-orange-500 text-foreground text-xs font-bold">
          <Zap className="w-3 h-3 mr-1" />
          NITRO 12h
        </Badge>
      );
    case 'EXPRESS':
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          EXPRESS
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs border-slate-500/30 text-muted-foreground">
          STANDARD
        </Badge>
      );
  }
};

const getStatusLabel = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Mock data generators
const generateMockProjects = (): Order[] => [
  {
    id: '1', orderNumber: 'ORD-2024-001', clientId: '1', serviceId: '1',
    status: 'IN_PROGRESS', priority: 'STANDARD', title: 'Product Photos Batch #45',
    description: 'E-commerce product photography', requirements: null,
    quantity: 150, baseAmount: 150, priorityBonus: 0, totalAmount: 150,
    isPaid: true, deadline: '2024-01-20', completedAt: null,
    createdAt: '2024-01-10', updatedAt: '2024-01-15',
    sourceFiles: null, deliverableFiles: null, serviceType: 'IMAGE',
    webRequirements: null, deploymentUrl: null
  },
  {
    id: '2', orderNumber: 'ORD-2024-002', clientId: '1', serviceId: '2',
    status: 'QA', priority: 'EXPRESS', title: 'E-commerce Collection',
    description: 'Fashion collection retouching', requirements: null,
    quantity: 45, baseAmount: 67.5, priorityBonus: 10.12, totalAmount: 77.62,
    isPaid: true, deadline: '2024-01-16', completedAt: null,
    createdAt: '2024-01-12', updatedAt: '2024-01-14',
    sourceFiles: null, deliverableFiles: null, serviceType: 'IMAGE',
    webRequirements: null, deploymentUrl: null
  },
  {
    id: '3', orderNumber: 'ORD-2024-003', clientId: '1', serviceId: '3',
    status: 'COMPLETED', priority: 'NITRO', title: 'Fashion Campaign Retouching',
    description: 'High-end fashion campaign', requirements: null,
    quantity: 28, baseAmount: 140, priorityBonus: 35, totalAmount: 175,
    isPaid: true, deadline: '2024-01-12', completedAt: '2024-01-11',
    createdAt: '2024-01-09', updatedAt: '2024-01-11',
    sourceFiles: null, deliverableFiles: null, serviceType: 'IMAGE',
    webRequirements: null, deploymentUrl: null
  },
  {
    id: '4', orderNumber: 'ORD-2024-004', clientId: '1', serviceId: '4',
    status: 'PENDING', priority: 'STANDARD', title: 'Video Promo Editing',
    description: 'Product promotional video', requirements: null,
    quantity: 3, baseAmount: 450, priorityBonus: 0, totalAmount: 450,
    isPaid: false, deadline: '2024-01-25', completedAt: null,
    createdAt: '2024-01-14', updatedAt: '2024-01-14',
    sourceFiles: null, deliverableFiles: null, serviceType: 'VIDEO',
    webRequirements: null, deploymentUrl: null
  },
  {
    id: '5', orderNumber: 'ORD-2024-005', clientId: '1', serviceId: '5',
    status: 'DRAFT', priority: 'STANDARD', title: 'AI Background Removal Batch',
    description: 'Automated background removal', requirements: null,
    quantity: 500, baseAmount: 50, priorityBonus: 0, totalAmount: 50,
    isPaid: false, deadline: null, completedAt: null,
    createdAt: '2024-01-15', updatedAt: '2024-01-15',
    sourceFiles: null, deliverableFiles: null, serviceType: 'AI',
    webRequirements: null, deploymentUrl: null
  },
];

const generateMockTransactions = (): Transaction[] => [
  {
    id: '1', userId: '1', type: 'DEPOSIT', amount: 500, currency: 'USD',
    status: 'SUCCESS', paymentMethod: 'card', stripeId: 'pi_xxx',
    description: 'Wallet deposit', metadata: null, createdAt: '2024-01-15'
  },
  {
    id: '2', userId: '1', type: 'ORDER_PAYMENT', amount: -150, currency: 'USD',
    status: 'SUCCESS', paymentMethod: null, stripeId: null,
    description: 'Payment for ORD-2024-001', metadata: null, createdAt: '2024-01-14'
  },
  {
    id: '3', userId: '1', type: 'ORDER_PAYMENT', amount: -77.62, currency: 'USD',
    status: 'SUCCESS', paymentMethod: null, stripeId: null,
    description: 'Payment for ORD-2024-002', metadata: null, createdAt: '2024-01-12'
  },
  {
    id: '4', userId: '1', type: 'DEPOSIT', amount: 200, currency: 'USD',
    status: 'SUCCESS', paymentMethod: 'card', stripeId: 'pi_yyy',
    description: 'Wallet deposit', metadata: null, createdAt: '2024-01-10'
  },
  {
    id: '5', userId: '1', type: 'REFUND', amount: 25, currency: 'USD',
    status: 'SUCCESS', paymentMethod: null, stripeId: null,
    description: 'Partial refund for ORD-2024-006', metadata: null, createdAt: '2024-01-08'
  },
];

const generateMockAssets = (): Asset[] => [
  {
    id: '1', userId: '1', orderId: '1', filename: 'product_001.jpg',
    originalName: 'Product Photo 001.jpg', mimeType: 'image/jpeg',
    size: 2456789, bucket: 'uploads', path: '/uploads/user1/product_001.jpg',
    url: 'https://example.com/uploads/product_001.jpg', isPublic: false,
    createdAt: '2024-01-10'
  },
  {
    id: '2', userId: '1', orderId: '1', filename: 'product_002.png',
    originalName: 'Product Photo 002.png', mimeType: 'image/png',
    size: 3456789, bucket: 'uploads', path: '/uploads/user1/product_002.png',
    url: 'https://example.com/uploads/product_002.png', isPublic: false,
    createdAt: '2024-01-10'
  },
  {
    id: '3', userId: '1', orderId: '3', filename: 'fashion_moodboard.psd',
    originalName: 'Fashion Moodboard.psd', mimeType: 'image/vnd.adobe.photoshop',
    size: 45678901, bucket: 'uploads', path: '/uploads/user1/fashion_moodboard.psd',
    url: 'https://example.com/uploads/fashion_moodboard.psd', isPublic: false,
    createdAt: '2024-01-09'
  },
  {
    id: '4', userId: '1', orderId: '4', filename: 'promo_video.mp4',
    originalName: 'Product Promo.mp4', mimeType: 'video/mp4',
    size: 156789012, bucket: 'uploads', path: '/uploads/user1/promo_video.mp4',
    url: 'https://example.com/uploads/promo_video.mp4', isPublic: false,
    createdAt: '2024-01-14'
  },
  {
    id: '5', userId: '1', orderId: null, filename: 'brand_guidelines.pdf',
    originalName: 'Brand Guidelines 2024.pdf', mimeType: 'application/pdf',
    size: 5678901, bucket: 'uploads', path: '/uploads/user1/brand_guidelines.pdf',
    url: 'https://example.com/uploads/brand_guidelines.pdf', isPublic: false,
    createdAt: '2024-01-05'
  },
];

const generateMockTickets = (): (SupportTicket & { messages: { id: string; senderId: string; senderName: string; message: string; createdAt: string }[] })[] => [
  {
    id: '1', clientId: '1', orderId: '1', subject: 'Question about delivery time',
    description: 'I need to know when my order will be delivered.',
    status: 'OPEN', priority: 'NORMAL', createdAt: '2024-01-14', updatedAt: '2024-01-14',
    resolvedAt: null,
    messages: [
      { id: '1', senderId: '1', senderName: 'You', message: 'Hi, I need to know when my order will be delivered. It\'s urgent.', createdAt: '2024-01-14T10:00:00' },
      { id: '2', senderId: 'support', senderName: 'Support Team', message: 'Hello! Your order is currently in progress and is expected to be completed by January 20th. Is there anything specific you need?', createdAt: '2024-01-14T10:30:00' },
    ]
  },
  {
    id: '2', clientId: '1', orderId: null, subject: 'Billing inquiry',
    description: 'Need clarification on my recent invoice.',
    status: 'IN_PROGRESS', priority: 'HIGH', createdAt: '2024-01-13', updatedAt: '2024-01-14',
    resolvedAt: null,
    messages: [
      { id: '1', senderId: '1', senderName: 'You', message: 'I have a question about my invoice for ORD-2024-002.', createdAt: '2024-01-13T14:00:00' },
    ]
  },
  {
    id: '3', clientId: '1', orderId: '3', subject: 'Revision request',
    description: 'Need minor adjustments to delivered files.',
    status: 'RESOLVED', priority: 'NORMAL', createdAt: '2024-01-10', updatedAt: '2024-01-11',
    resolvedAt: '2024-01-11',
    messages: [
      { id: '1', senderId: '1', senderName: 'You', message: 'The files look great! Just need a small adjustment on image 3.', createdAt: '2024-01-10T16:00:00' },
      { id: '2', senderId: 'support', senderName: 'Support Team', message: 'Sure! We\'ve noted your feedback. The team will make the adjustments.', createdAt: '2024-01-10T16:30:00' },
      { id: '3', senderId: 'support', senderName: 'Support Team', message: 'Your revision has been completed. Please check the deliverables.', createdAt: '2024-01-11T09:00:00' },
    ]
  },
];

// Loading Skeleton Components
const StatsSkeleton = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// ============================================
// 1. CLIENT DASHBOARD
// ============================================

export function ClientDashboard() {
  const { user } = useAppStore();
  const { handleNavigate } = useNavigation();
  
  // Fetch orders from API
  const { data: ordersData, loading: ordersLoading, refetch: refetchOrders } = useApi<{
    orders: Array<{
      id: string;
      orderNumber: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      quantity: number;
      serviceType: string;
      baseAmount: number;
      priorityBonus: number;
      totalAmount: number;
      isPaid: boolean;
      deadline: string | null;
      createdAt: string;
      service?: { id: string; name: string; category: string };
    }>;
    pagination: { total: number };
  }>({ url: '/api/orders' });

  // Fetch transactions from API
  const { data: transactionsData, loading: transactionsLoading } = useApi<{
    transactions: Array<{
      id: string;
      type: string;
      amount: number;
      currency: string;
      status: string;
      description: string | null;
      createdAt: string;
    }>;
  }>({ url: '/api/transactions' });

  // Fetch statistics from API
  const { data: statsData } = useApi<{
    stats: {
      walletBalance: number;
      activeProjects: number;
      inProduction: number;
      completedThisMonth: number;
    };
  }>({ url: '/api/statistics' });

  const loading = ordersLoading || transactionsLoading;
  const projects = ordersData?.orders || [];
  const transactions = transactionsData?.transactions || [];

  const activeProjects = projects.filter(p => 
    ['PENDING', 'IN_PROGRESS', 'QA', 'REVISION'].includes(p.status)
  );
  
  const inProduction = activeProjects.reduce((acc, p) => acc + p.quantity, 0);
  const completedThisMonth = projects.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + p.quantity, 0);
  const nitroCount = projects.filter(p => p.priority === 'NITRO').length;

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <StatsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Welcome back, <span className="gradient-text">{user?.name || 'User'}</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">Here's what's happening with your projects</p>
          </div>
          <div className="flex gap-3">
            {nitroCount > 0 && (
              <Badge className="badge-premium nitro-glow">
                <Zap className="w-3 h-3 mr-1" />
                {nitroCount} Nitro Active
              </Badge>
            )}
            <Button className="btn-premium" onClick={() => handleNavigate('/brief/new')}>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Wallet Balance"
              value={formatCurrency(user?.walletBalance || 0)}
              icon={DollarSign}
              trend="up"
              trendValue="Ready to use"
              className="hover:border-emerald-500 transition-colors"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Active Projects"
              value={activeProjects.length}
              icon={Folder}
              trend="neutral"
              trendValue="In progress"
              className="hover:border-blue-500/30 transition-colors"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="In Production"
              value={inProduction.toLocaleString()}
              icon={Clock}
              trend="up"
              trendValue="images"
              className="hover:border-amber-500/30 transition-colors"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Completed"
              value={completedThisMonth.toLocaleString()}
              icon={CheckCircle}
              trend="up"
              trendValue="this month"
              className="hover:border-teal-500/30 transition-colors"
            />
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="grid lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Projects List */}
          <motion.div 
            className="lg:col-span-2"
            variants={fadeInUp}
          >
            <GlassCard variant="default" padding="none" className="overflow-hidden">
              <div className="flex flex-row items-center justify-between p-4 sm:p-6 pb-4 border-b border-border">
                <h3 className="text-base sm:text-lg font-semibold gradient-text">Active Projects</h3>
                <button onClick={() => handleNavigate('/projects')} className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline flex items-center gap-1 btn-secondary-premium px-3 py-1.5 rounded-lg transition-colors">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 mt-4">
                  {activeProjects.slice(0, 4).map((project, idx) => (
                    <motion.div
                      key={project.id}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: idx * 0.08 }}
                      className="p-4 rounded-xl bg-muted/30 dark:bg-white/5 hover:bg-accent dark:hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-emerald-500 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium group-hover:text-emerald-600 dark:text-emerald-400 transition-colors truncate">{project.title}</h4>
                            {getPriorityBadge(project.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground">{project.quantity} images · {project.serviceType}</p>
                        </div>
                        <Badge className={`badge-premium ${getStatusColor(project.status)} shrink-0`}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {project.orderNumber}
                        </span>
                        {project.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {formatDate(project.deadline)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 ml-auto font-semibold text-emerald-400">
                          {formatCurrency(project.totalAmount)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              variants={fadeInUp}
            >
              <GlassCard variant="default" padding="none" className="overflow-hidden">
                <div className="p-4 sm:p-6 pb-4 border-b border-border">
                  <h3 className="text-base sm:text-lg font-semibold gradient-text">Quick Actions</h3>
                </div>
                <div className="p-4 sm:p-6 pt-4 space-y-2 sm:space-y-3">
                  <Button variant="outline" className="w-full justify-start border-border hover:bg-muted/30 dark:bg-white/5 hover:border-emerald-500 btn-secondary-premium transition-all" onClick={() => handleNavigate('/brief/new')}>
                    <Upload className="w-4 h-4 mr-2 text-emerald-400" />
                    Upload Files
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border hover:bg-muted/30 dark:bg-white/5 hover:border-blue-500/30 btn-secondary-premium transition-all" onClick={() => handleNavigate('/billing')}>
                    <CreditCard className="w-4 h-4 mr-2 text-blue-400" />
                    Add Funds
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border hover:bg-muted/30 dark:bg-white/5 hover:border-amber-500/30 btn-secondary-premium transition-all" onClick={() => handleNavigate('/support')}>
                    <HeadphonesIcon className="w-4 h-4 mr-2 text-amber-400" />
                    Get Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border hover:bg-muted/30 dark:bg-white/5 hover:border-teal-500/30 btn-secondary-premium transition-all" onClick={() => handleNavigate('/messages')}>
                    <MessageSquare className="w-4 h-4 mr-2 text-teal-400" />
                    Messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border hover:bg-muted/30 dark:bg-white/5 hover:border-purple-500/30 btn-secondary-premium transition-all" onClick={() => handleNavigate('/assets')}>
                    <FolderOpen className="w-4 h-4 mr-2 text-purple-400" />
                    File Manager
                  </Button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              variants={fadeInUp}
            >
              <GlassCard variant="default" padding="none" className="overflow-hidden">
                <div className="flex flex-row items-center justify-between p-4 sm:p-6 pb-4 border-b border-border">
                  <h3 className="text-base sm:text-lg font-semibold gradient-text">Recent Transactions</h3>
                  <button onClick={() => handleNavigate('/billing')} className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors btn-secondary-premium px-3 py-1.5 rounded-lg">View All</button>
                </div>
                <div className="p-4 sm:p-6 pt-4">
                  <div className="space-y-2 sm:space-y-3">
                    {transactions.slice(0, 4).map((tx, idx) => (
                      <motion.div 
                        key={tx.id} 
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/30 dark:bg-white/5 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${
                            tx.amount > 0 ? 'bg-emerald-500/30 dark:bg-emerald-500/20' : 'bg-red-500/20'
                          }`}>
                            {tx.amount > 0 ? (
                              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{tx.type.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`font-semibold text-sm sm:text-base ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// 2. ORDER BUILDER (5-STEP WIZARD)
// ============================================

export function OrderBuilder() {
  const { user } = useAppStore();
  const { handleNavigate } = useNavigation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    serviceType: 'IMAGE' as ServiceType,
    title: '',
    description: '',
    quantity: 1,
    priority: 'STANDARD' as OrderPriority,
    files: [] as File[],
    deadline: '',
  });
  const [dragActive, setDragActive] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (data.services) setServices(data.services);
      })
      .catch(err => console.error('Failed to fetch services', err));
  }, []);

  const steps = [
    { number: 1, title: 'Service Type', icon: Folder },
    { number: 2, title: 'Requirements', icon: FileText },
    { number: 3, title: 'Upload Files', icon: Upload },
    { number: 4, title: 'Deadline', icon: Calendar },
    { number: 5, title: 'Confirm', icon: CheckCircle },
  ];

  const serviceOptions = [
    { 
      type: 'IMAGE' as ServiceType, 
      icon: ImageIcon, 
      title: 'Image Editing', 
      desc: 'Clipping path, retouching, color correction, background removal',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      type: 'VIDEO' as ServiceType, 
      icon: Video, 
      title: 'Video Editing', 
      desc: 'Color grading, motion graphics, transitions, subtitles',
      gradient: 'from-blue-500 to-purple-600'
    },
    { 
      type: 'AI' as ServiceType, 
      icon: Sparkles, 
      title: 'AI Operations', 
      desc: 'Batch processing, automation, AI-powered enhancements',
      gradient: 'from-amber-500 to-orange-600'
    },
  ];

  const priorityOptions = [
    { type: 'STANDARD' as OrderPriority, time: '24-48h', price: 'Base price', color: 'slate' },
    { type: 'EXPRESS' as OrderPriority, time: '12-24h', price: '+15%', color: 'amber' },
    { type: 'NITRO' as OrderPriority, time: '12h', price: '+25%', color: 'red' },
  ];

  const calculatePrice = () => {
    const basePrice = formData.serviceType === 'VIDEO' ? 150 : formData.serviceType === 'AI' ? 0.10 : 1;
    let total = basePrice * formData.quantity;
    if (formData.priority === 'EXPRESS') total *= 1.15;
    if (formData.priority === 'NITRO') total *= 1.25;
    return total;
  };

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
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.dataTransfer.files)]
      }));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(files)]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Find a service matching the selected serviceType
      const serviceMap: Record<string, string> = {
        'IMAGE': 'image',
        'VIDEO': 'video',
        'AI': 'ai',
        'WEB': 'web',
      };
      const categorySlug = serviceMap[formData.serviceType] || 'image';

      // Find a service that matches this category
      const matchingService = services.find((s: any) => s.category?.toLowerCase() === categorySlug);
      if (!matchingService) {
        throw new Error(`No service found for ${formData.serviceType}. Please contact support.`);
      }

      // Build order payload
      const orderPayload: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        quantity: formData.quantity,
        priority: formData.priority,
        serviceId: matchingService.id,
        deadline: formData.deadline || null,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Order created successfully
      // Show success and redirect to projects page
      handleNavigate('/projects');
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true;
      case 2: return formData.title.trim() !== '';
      case 3: return formData.files.length > 0;
      case 4: return formData.deadline !== '';
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => handleNavigate('/dashboard')} className="text-sm text-muted-foreground hover:text-white flex items-center gap-1 mb-4">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">Create New Order</h1>
          <p className="text-muted-foreground">Complete the steps below to submit your project</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 overflow-x-auto pb-4">
          <div className="flex items-center justify-between min-w-[600px]">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      step >= s.number
                        ? 'border-emerald-500 bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400'
                        : 'border-border text-muted-foreground'
                    }`}>
                      {step > s.number ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`mt-2 text-xs ${step >= s.number ? 'text-white' : 'text-muted-foreground'}`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-16 sm:w-24 h-0.5 mx-4 ${
                      step > s.number ? 'bg-emerald-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="glass-card">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Service Type */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Select Service Type</h2>
                    <p className="text-muted-foreground text-sm">Choose the type of service you need</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {serviceOptions.map((s) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.type}
                          onClick={() => setFormData(prev => ({ ...prev, serviceType: s.type }))}
                          className={`p-6 rounded-xl border text-left transition-all relative overflow-hidden group ${
                            formData.serviceType === s.type
                              ? 'border-emerald-500 bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10'
                              : 'border-border hover:border-border/80'
                          }`}
                        >
                          {formData.serviceType === s.type && (
                            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-10`} />
                          )}
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold mb-1">{s.title}</h3>
                          <p className="text-sm text-muted-foreground">{s.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Requirements */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Project Requirements</h2>
                    <p className="text-muted-foreground text-sm">Tell us about your project</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Project Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Product Photos Batch #45"
                        className="bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500 mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your requirements in detail..."
                        rows={4}
                        className="bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500 mt-1.5 resize-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        className="bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500 mt-1.5 w-32"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Upload Files */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Upload Files</h2>
                    <p className="text-muted-foreground text-sm">Upload your source files</p>
                  </div>
                  
                  {/* Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                      dragActive
                        ? 'border-emerald-500 bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10'
                        : 'border-border/80 hover:border-emerald-500'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">
                        {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                      </p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supports: JPG, PNG, TIFF, PSD, RAW, MP4, MOV, AI, EPS
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {formData.files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{formData.files.length} file(s) selected</p>
                      <ScrollArea className="h-40 rounded-lg bg-muted/30 dark:bg-white/5 p-3">
                        <div className="space-y-2">
                          {formData.files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30 dark:bg-white/5">
                              <div className="flex items-center gap-2">
                                <File className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(idx)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 4: Deadline & Priority */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Select Priority & Deadline</h2>
                    <p className="text-muted-foreground text-sm">Choose your turnaround time</p>
                  </div>
                  
                  {/* Priority Selection */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    {priorityOptions.map((p) => (
                      <button
                        key={p.type}
                        onClick={() => setFormData(prev => ({ ...prev, priority: p.type }))}
                        className={`p-6 rounded-xl border text-center transition-all ${
                          formData.priority === p.type
                            ? p.color === 'red' 
                              ? 'border-red-500/50 bg-red-500/10 nitro-glow' 
                              : p.color === 'amber' 
                                ? 'border-amber-500/50 bg-amber-500/10' 
                                : 'border-emerald-500 bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10'
                            : 'border-border hover:border-border/80'
                        }`}
                      >
                        {p.type === 'NITRO' && <Zap className="w-6 h-6 mx-auto mb-2 text-red-400" />}
                        <p className="font-semibold mb-1">{p.type}</p>
                        <p className="text-lg font-bold mb-2">{p.time}</p>
                        <p className="text-sm text-muted-foreground">{p.price}</p>
                      </button>
                    ))}
                  </div>

                  {/* Deadline */}
                  <div>
                    <Label htmlFor="deadline">Deadline Date *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500 mt-1.5 w-full sm:w-auto"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 5: Confirm */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Review & Confirm</h2>
                    <p className="text-muted-foreground text-sm">Please review your order details</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Service Type</span>
                      <span className="font-medium">{formData.serviceType}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Project Title</span>
                      <span className="font-medium">{formData.title}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium">{formData.quantity} items</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Files</span>
                      <span className="font-medium">{formData.files.length} file(s)</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Priority</span>
                      <div>{getPriorityBadge(formData.priority)}</div>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Deadline</span>
                      <span className="font-medium">{formatDate(formData.deadline)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-muted-foreground font-medium">Estimated Cost</span>
                      <span className="font-bold text-xl gradient-text">{formatCurrency(calculatePrice())}</span>
                    </div>
                  </div>

                  {/* Wallet Balance Check */}
                  <div className={`p-4 rounded-lg ${
                    (user?.walletBalance || 0) >= calculatePrice()
                      ? 'bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5" />
                      <div>
                        <p className="text-sm font-medium">
                          Wallet Balance: {formatCurrency(user?.walletBalance || 0)}
                        </p>
                        {(user?.walletBalance || 0) < calculatePrice() && (
                          <p className="text-xs text-red-400 mt-1">
                            Insufficient balance. Please add funds before placing order.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="border-border"
              >
                Previous
              </Button>
              {step < 5 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || (user?.walletBalance || 0) < calculatePrice()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Order
                      <CheckCircle className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// 3. PROJECTS LIST
// ============================================

export function ProjectsList() {
  const { user } = useAppStore();
  const { handleNavigate } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders?limit=100', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        if (data.orders) {
          const mappedOrders: Order[] = data.orders.map((o: Record<string, unknown>) => ({
            id: o.id as string,
            orderNumber: (o as { orderNumber?: string }).orderNumber || `ORD-${(o.id as string).slice(0, 8)}`,
            title: (o as { title?: string }).title || (o.service as { name?: string })?.name || 'Order',
            status: (o.status as 'PENDING' | 'IN_PROGRESS' | 'QA' | 'COMPLETED' | 'REVISION') || 'PENDING',
            createdAt: (o.createdAt as string) || new Date().toISOString(),
            updatedAt: (o.updatedAt as string) || new Date().toISOString(),
            quantity: (o.quantity as number) || 1,
            priority: (o.priority as string) || 'NORMAL',
            price: (o.price as number) || 0,
            description: (o.description as string) || '',
          }));
          setProjects(mappedOrders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.title.localeCompare(b.title);
        case 'status': return a.status.localeCompare(b.status);
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const statusCounts = {
    all: projects.length,
    PENDING: projects.filter(p => p.status === 'PENDING').length,
    IN_PROGRESS: projects.filter(p => p.status === 'IN_PROGRESS').length,
    QA: projects.filter(p => p.status === 'QA').length,
    COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Projects</h1>
            <p className="text-muted-foreground">Manage and track all your projects</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => handleNavigate('/brief/new')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-muted/30 dark:bg-white/5 border-border">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
              <SelectItem value="PENDING">Pending ({statusCounts.PENDING})</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress ({statusCounts.IN_PROGRESS})</SelectItem>
              <SelectItem value="QA">In QA ({statusCounts.QA})</SelectItem>
              <SelectItem value="COMPLETED">Completed ({statusCounts.COMPLETED})</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-full sm:w-40 bg-muted/30 dark:bg-white/5 border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="status">Sort by Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-32 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filter criteria</p>
              <Button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} variant="outline" className="border-border">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div onClick={() => handleNavigate(`/projects/${project.id}`)} className="cursor-pointer">
                  <Card className="glass-card hover:border-emerald-500 transition-all cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{project.orderNumber}</p>
                          <h3 className="font-medium">{project.title}</h3>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 mr-2" /> Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" /> Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {getPriorityBadge(project.priority)}
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{project.quantity} items</span>
                        <span>{formatCurrency(project.totalAmount)}</span>
                      </div>
                      {project.deadline && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Due: {formatDate(project.deadline)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 4. PROJECT DETAIL
// ============================================

export function ProjectDetail({ projectId }: { projectId?: string }) {
  const { user, setCurrentPage } = useAppStore();
  const { handleNavigate } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Order | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ id: string; senderId: string; senderName: string; content: string; createdAt: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch real project data
    const fetchProject = async () => {
      try {
        const res = await fetch('/api/orders?limit=1', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();
        if (data.orders?.[0]) {
          setProject(data.orders[0]);
        }
        
        // Fetch messages from chat API
        const messagesRes = await fetch('/api/chat/messages', { credentials: 'include' });
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          if (messagesData.messages) {
            setMessages(messagesData.messages.map((m: Record<string, string>) => ({
              id: m.id || Date.now().toString(),
              senderId: m.senderId || 'system',
              senderName: m.senderName || 'Support',
              content: m.content || m.message || '',
              createdAt: m.createdAt || new Date().toISOString(),
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      senderId: user?.id || '1',
      senderName: user?.name || 'You',
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-60 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setCurrentPage('/projects')} variant="outline" className="border-border">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = project.status === 'COMPLETED' ? 100 :
    project.status === 'QA' ? 90 :
    project.status === 'IN_PROGRESS' ? 65 :
    project.status === 'PENDING' ? 20 : 0;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button onClick={() => handleNavigate('/projects')} className="text-sm text-muted-foreground hover:text-white flex items-center gap-1 mb-6">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Projects
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              {getPriorityBadge(project.priority)}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{project.orderNumber}</span>
              <span>•</span>
              <span>{project.quantity} items</span>
              <span>•</span>
              <span>{project.serviceType}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(project.status)}>
              {getStatusLabel(project.status)}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="grid grid-cols-4 gap-4 text-center text-sm">
                  {['Pending', 'In Progress', 'QA', 'Completed'].map((stage, idx) => (
                    <div key={stage} className={`p-3 rounded-lg ${
                      idx <= (project.status === 'COMPLETED' ? 3 : project.status === 'QA' ? 2 : project.status === 'IN_PROGRESS' ? 1 : 0)
                        ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400'
                        : 'bg-muted/30 dark:bg-white/5 text-muted-foreground'
                    }`}>
                      {stage}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Service Type</p>
                    <p className="font-medium">{project.serviceType}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Priority</p>
                    <p className="font-medium">{project.priority}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="font-medium">{formatDate(project.createdAt)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                    <p className="font-medium">{project.deadline ? formatDate(project.deadline) : 'Not set'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="font-medium gradient-text">{formatCurrency(project.totalAmount)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                    <Badge className={project.isPaid ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                      {project.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
                {project.description && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p>{project.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deliverables Card */}
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                {project.status === 'COMPLETED' || project.status === 'DELIVERED' ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                          <File className="w-5 h-5 text-emerald-400" />
                          <div>
                            <p className="text-sm font-medium">Deliverable_Batch_{i}.zip</p>
                            <p className="text-xs text-muted-foreground">50 images · {formatBytes(12345678)}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-border">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Deliverables will appear here once the project is completed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chat */}
          <div className="lg:col-span-1">
            <Card className="glass-card h-[600px] flex flex-col">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Project Chat
                </CardTitle>
                <CardDescription>Real-time communication with the team</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${
                          msg.senderId === user?.id
                            ? 'bg-emerald-500/30 dark:bg-emerald-500/20 rounded-l-xl rounded-tr-xl'
                            : 'bg-white/10 rounded-r-xl rounded-tl-xl'
                        } p-3`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              msg.senderId === user?.id ? 'text-emerald-400' : 'text-foreground/80'
                            }`}>
                              {msg.senderName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500"
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 5. BILLING PAGE
// ============================================

export function BillingPage() {
  const { user, refreshUser } = useAppStore();
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [amount, setAmount] = useState('100');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paypalConfig, setPaypalConfig] = useState<{ enabled: boolean; clientId?: string; currency?: string } | null>(null);
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');

  const handleScroll = (direction: 'top' | 'bottom') => {
    const el = document.getElementById('transactions-scroll');
    if (el) {
      const viewport = el.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: direction === 'top' ? 0 : viewport.scrollHeight, behavior: 'smooth' });
      }
      setScrollDirection(direction);
    }
  };

  // Fetch transactions from API
  const { data: transactionsData, loading: transactionsLoading, refetch: refetchTransactions } = useApi<{
    transactions: Array<{
      id: string;
      type: string;
      amount: number;
      currency: string;
      status: string;
      description: string | null;
      createdAt: string;
    }>;
  }>({ url: '/api/transactions' });

  // Fetch wallet stats from API
  const { data: statsData } = useApi<{
    stats: {
      totalDeposits: number;
      totalSpent: number;
      transactionCount: number;
    };
  }>({ url: '/api/statistics?type=wallet' });

  // Fetch PayPal config
  useEffect(() => {
    const fetchPaypalConfig = async () => {
      try {
        const response = await fetch('/api/payments/paypal', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setPaypalConfig(data);
        }
      } catch (error) {
        console.error('Failed to fetch PayPal config:', error);
      }
    };
    fetchPaypalConfig();
  }, []);

  const transactions = transactionsData?.transactions || [];
  const stats = statsData?.stats || { totalDeposits: 0, totalSpent: 0, transactionCount: 0 };
  const loading = transactionsLoading;
  const quickAmounts = [50, 100, 250, 500, 1000];

  // PayPal payment handler
  const handlePayPalPayment = async () => {
    if (!paypalConfig?.enabled || !paypalConfig?.clientId) {
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      return;
    }

    setPaymentLoading(true);
    setPaymentStatus('processing');

    try {
      // Create PayPal order
      const createResponse = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create',
          amount: numAmount,
          currency: paypalConfig.currency || 'USD',
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const { orderId } = await createResponse.json();

      // Open PayPal in a popup window
      const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
      const popup = window.open(
        paypalUrl,
        'PayPal Checkout',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Poll for payment completion
      const checkCompletion = async () => {
        try {
          const captureResponse = await fetch('/api/payments/paypal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              action: 'capture',
              orderId,
            }),
          });

          if (captureResponse.ok) {
            const result = await captureResponse.json();
            if (result.success) {
              setPaymentStatus('success');
              setAddFundsOpen(false);
              refreshUser?.();
              refetchTransactions();
              popup?.close();
              return;
            }
          }
        } catch {
          // Payment not yet complete, continue polling
        }

        // Continue polling if popup is still open
        if (popup && !popup.closed) {
          setTimeout(checkCompletion, 2000);
        } else {
          // Popup was closed, check final status
          setPaymentStatus('idle');
          setPaymentLoading(false);
        }
      };

      // Start polling after a delay
      setTimeout(checkCompletion, 3000);

    } catch (error) {
      console.error('PayPal payment error:', error);
      setPaymentStatus('error');
      setPaymentLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Billing & Wallet</h1>

        {/* Balance Card */}
        <Card className="glass-card mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
          <CardContent className="relative p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="text-muted-foreground mb-2">Available Balance</p>
                <div className="text-5xl font-bold gradient-text mb-4">
                  {formatCurrency(user?.walletBalance || 0)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Updated just now</span>
                </div>
              </div>
              <Dialog open={addFundsOpen} onOpenChange={(open) => {
                setAddFundsOpen(open);
                if (!open) {
                  setPaymentStatus('idle');
                  setPaymentLoading(false);
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle>Add Funds to Wallet</DialogTitle>
                    <DialogDescription>
                      Choose an amount to add to your wallet balance
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-3 gap-3">
                      {quickAmounts.map((amt) => (
                        <Button
                          key={amt}
                          variant={amount === amt.toString() ? 'default' : 'outline'}
                          onClick={() => setAmount(amt.toString())}
                          className={amount === amt.toString() 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                            : 'border-border'
                          }
                        >
                          ${amt}
                        </Button>
                      ))}
                    </div>
                    <div>
                      <Label htmlFor="custom-amount">Custom Amount</Label>
                      <div className="relative mt-1.5">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="custom-amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-8 bg-muted/30 dark:bg-white/5 border-border"
                          min="10"
                        />
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    {paypalConfig?.enabled ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/30 dark:bg-white/5 border border-emerald-500/30">
                          <div className="flex items-center gap-3 mb-3">
                            <img 
                              src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" 
                              alt="PayPal" 
                              className="h-6"
                            />
                            <span className="text-sm font-medium">Pay via PayPal</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            You will be redirected to PayPal to complete your payment securely.
                          </p>
                          <Button 
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={handlePayPalPayment}
                            disabled={paymentLoading || parseFloat(amount) < 10}
                          >
                            {paymentLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                Pay {formatCurrency(parseFloat(amount) || 0)} with PayPal
                              </>
                            )}
                          </Button>
                        </div>

                        {paymentStatus === 'error' && (
                          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                            Payment failed. Please try again.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                        <div className="flex items-center gap-3 mb-3">
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                          <span className="text-sm">Payment gateway not configured</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Please contact support to add funds to your wallet.
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddFundsOpen(false)} className="border-border">
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/30 dark:bg-emerald-500/20 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Deposits</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalDeposits)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-bold">{stats.transactionCount || transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="glass-card relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <Button variant="outline" size="sm" className="border-border">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add funds to your wallet to get started
                </p>
                <Button onClick={() => setAddFundsOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="h-96" id="transactions-scroll">
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 dark:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.amount > 0 ? 'bg-emerald-500/30 dark:bg-emerald-500/20' : 'bg-red-500/20'
                          }`}>
                            {tx.type === 'DEPOSIT' ? (
                              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                            ) : tx.type === 'REFUND' ? (
                              <RefreshCw className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{tx.description || tx.type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{formatDateTime(tx.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                          </p>
                          <Badge variant="outline" className={`text-xs ${
                            tx.status === 'SUCCESS' ? 'border-emerald-500/50 text-emerald-400' : 'border-amber-500/30 text-amber-400'
                          }`}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// 6. SUPPORT PAGE
// ============================================

export function SupportPage() {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<ReturnType<typeof generateMockTickets>>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<{ subject: string; description: string; priority: string }>({ subject: '', description: '', priority: 'NORMAL' });
  const [message, setMessage] = useState('');
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');

  const handleScroll = (direction: 'top' | 'bottom') => {
    const el = document.getElementById('tickets-scroll');
    if (el) {
      const viewport = el.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: direction === 'top' ? 0 : viewport.scrollHeight, behavior: 'smooth' });
      }
      setScrollDirection(direction);
    }
  };

  useEffect(() => {
    // Fetch real tickets from API
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/tickets', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch tickets');
        const data = await res.json();
        if (data.tickets) {
          setTickets(data.tickets);
        }
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const selectedTicketData = tickets.find(t => t.id === selectedTicket);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedTicket) return;
    // In a real app, this would send to the server
    const ticket = tickets.find(t => t.id === selectedTicket);
    if (ticket) {
      ticket.messages.push({
        id: Date.now().toString(),
        senderId: user?.id || '1',
        senderName: user?.name || 'You',
        message: message,
        createdAt: new Date().toISOString(),
      });
      setTickets([...tickets]);
    }
    setMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'IN_PROGRESS': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'RESOLVED': return 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'CLOSED': return 'bg-slate-500/20 text-muted-foreground border-slate-500/30';
      default: return 'bg-slate-500/20 text-muted-foreground border-slate-500/30';
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Support Center</h1>
            <p className="text-muted-foreground">Get help with your orders and account</p>
          </div>
          <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we'll get back to you as soon as possible
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief summary of your issue"
                    className="bg-muted/30 dark:bg-white/5 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(v) => setNewTicket(prev => ({ ...prev, priority: v as 'NORMAL' | 'HIGH' | 'LOW' | 'URGENT' }))}>
                    <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide details about your issue..."
                    rows={4}
                    className="bg-muted/30 dark:bg-white/5 border-border mt-1.5 resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewTicketOpen(false)} className="border-border">
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-teal-600"
                  onClick={() => setNewTicketOpen(false)}
                >
                  Submit Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-60 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-1">
              <Card className="glass-card relative">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Your Tickets</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]" id="tickets-scroll">
                    <div className="divide-y divide-white/5">
                      {tickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket.id)}
                          className={`w-full p-4 text-left hover:bg-muted/30 dark:bg-white/5 transition-colors ${
                            selectedTicket === ticket.id ? 'bg-muted/30 dark:bg-white/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm line-clamp-1">{ticket.subject}</h4>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{ticket.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>#{ticket.id}</span>
                            <span>{formatDate(ticket.createdAt)}</span>
                          </div>
                        </button>
                      ))}
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
                </CardContent>
              </Card>
            </div>

            {/* Ticket Detail / Chat */}
            <div className="lg:col-span-2">
              {selectedTicketData ? (
                <Card className="glass-card h-[600px] flex flex-col">
                  <CardHeader className="pb-4 border-b border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedTicketData.subject}</CardTitle>
                        <CardDescription className="mt-1">
                          #{selectedTicketData.id} · Created {formatDate(selectedTicketData.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(selectedTicketData.status)}>
                        {selectedTicketData.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {selectedTicketData.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${
                              msg.senderId === user?.id
                                ? 'bg-emerald-500/30 dark:bg-emerald-500/20 rounded-l-xl rounded-tr-xl'
                                : 'bg-white/10 rounded-r-xl rounded-tl-xl'
                            } p-4`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-medium ${
                                  msg.senderId === user?.id ? 'text-emerald-400' : 'text-foreground/80'
                                }`}>
                                  {msg.senderName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(msg.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {selectedTicketData.status !== 'CLOSED' && selectedTicketData.status !== 'RESOLVED' && (
                      <div className="p-4 border-t border-border">
                        <div className="flex gap-2">
                          <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your reply..."
                            className="bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500"
                          />
                          <Button
                            onClick={handleSendMessage}
                            size="icon"
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 shrink-0"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card h-[600px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a ticket</h3>
                    <p className="text-muted-foreground">Choose a ticket from the list to view the conversation</p>
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

// ============================================
// 7. ASSETS PAGE
// ============================================

export function AssetsPage() {
  const { user } = useAppStore();
  const { handleNavigate } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Fetch real assets from API
    const fetchAssets = async () => {
      try {
        const res = await fetch('/api/assets', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch assets');
        const data = await res.json();
        if (data.assets) {
          setAssets(data.assets);
        }
      } catch (err) {
        console.error('Failed to fetch assets:', err);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const filteredAssets = assets.filter(a => 
    a.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = assets.reduce((acc, a) => acc + a.size, 0);

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
    // Handle file upload
  };

  const toggleSelect = (id: string) => {
    setSelectedAssets(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-blue-400" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">File Manager</h1>
            <p className="text-muted-foreground">Manage your files and assets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-border" onClick={() => handleNavigate('/brief/new')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/30 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                  <p className="text-xl font-bold">{assets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-xl font-bold">{formatBytes(totalSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shared Files</p>
                  <p className="text-xl font-bold">{assets.filter(a => a.isPublic).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-10 bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'border-border'}
            >
              <FolderOpen className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'border-border'}
            >
              <FileText className="w-4 h-4" />
            </Button>
            {selectedAssets.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedAssets.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Files</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedAssets.length} file(s)? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => {
                        setAssets(prev => prev.filter(a => !selectedAssets.includes(a.id)));
                        setSelectedAssets([]);
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Drop Zone Overlay */}
        {dragActive && (
          <div
            className="fixed inset-0 z-50 bg-emerald-500/30 dark:bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto text-emerald-600 dark:text-emerald-400 mb-4" />
              <p className="text-xl font-medium">Drop files here to upload</p>
            </div>
          </div>
        )}

        {/* Files */}
        <Card 
          className="glass-card"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-6">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No files found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try a different search term' : 'Upload files to get started'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`group relative p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedAssets.includes(asset.id)
                        ? 'border-emerald-500 bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10'
                        : 'border-border hover:border-border/80'
                    }`}
                    onClick={() => toggleSelect(asset.id)}
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-black/50">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Eye className="w-4 h-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Download className="w-4 h-4 mr-2" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Share2 className="w-4 h-4 mr-2" /> Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-muted/30 dark:bg-white/5 flex items-center justify-center mb-3">
                      {getFileIcon(asset.mimeType)}
                    </div>
                    <p className="text-sm font-medium truncate mb-1">{asset.originalName}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(asset.size)}</p>
                    {asset.orderId && (
                      <p className="text-xs text-emerald-400 mt-1">Linked to order</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedAssets.includes(asset.id)
                        ? 'border-emerald-500 bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10'
                        : 'border-border hover:border-border/80'
                    }`}
                    onClick={() => toggleSelect(asset.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted/30 dark:bg-white/5 flex items-center justify-center">
                        {getFileIcon(asset.mimeType)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{asset.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(asset.size)} · {formatDate(asset.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// 8. PROFILE PAGE
// ============================================

export function ProfilePage() {
  const { user, updateUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: '',
    timezone: 'UTC',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateUser({ name: formData.name });
    setSaving(false);
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatar || ''} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="border-border mb-2">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-muted/30 dark:bg-white/5 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted/30 dark:bg-white/5 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="bg-muted/30 dark:bg-white/5 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Your company name"
                    className="bg-muted/30 dark:bg-white/5 border-border mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Address</CardTitle>
              <CardDescription>Your billing and shipping address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St"
                  className="bg-muted/30 dark:bg-white/5 border-border mt-1.5"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="bg-muted/30 dark:bg-white/5 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(v) => setFormData(prev => ({ ...prev, country: v }))}>
                    <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border mt-1.5">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(v) => setFormData(prev => ({ ...prev, timezone: v }))}>
                    <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                      <SelectItem value="CET">Central European</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(v) => setFormData(prev => ({ ...prev, language: v }))}>
                    <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border mt-1.5">
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
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={formData.notifications.email}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={formData.notifications.push}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))
                  }
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                </div>
                <Switch
                  checked={formData.notifications.sms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, sms: checked }
                    }))
                  }
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Receive promotional content</p>
                </div>
                <Switch
                  checked={formData.notifications.marketing}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, marketing: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                </div>
                <Button variant="outline" className="border-border">
                  Change Password
                </Button>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" className="border-border">
                  Enable 2FA
                </Button>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">Manage your logged in devices</p>
                </div>
                <Button variant="outline" className="border-border">
                  View Sessions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="border-border">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 9. MESSAGES PAGE
// ============================================

export function MessagesPage() {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<(ChatRoom & { lastMessage_sender?: string; unread?: number })[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ id: string; senderId: string; senderName: string; content: string; createdAt: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevSelectedRoomRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRooms([
        {
          id: '1', type: 'PROJECT', name: 'Product Photos Batch #45', orderId: '1', ticketId: null,
          lastMessage: 'First batch is ready for review',
          lastMessageAt: '2024-01-15T10:30:00',
          createdAt: '2024-01-10', updatedAt: '2024-01-15'
        },
        {
          id: '2', type: 'DIRECT', name: 'Support Team', orderId: null, ticketId: null,
          lastMessage: 'How can I help you today?',
          lastMessageAt: '2024-01-14T15:00:00',
          createdAt: '2024-01-08', updatedAt: '2024-01-14'
        },
        {
          id: '3', type: 'PROJECT', name: 'Video Promo Editing', orderId: '4', ticketId: null,
          lastMessage: 'Working on the final cut',
          lastMessageAt: '2024-01-13T09:15:00',
          createdAt: '2024-01-12', updatedAt: '2024-01-13'
        },
        {
          id: '4', type: 'SUPPORT', name: 'Billing Inquiry', orderId: null, ticketId: '2',
          lastMessage: 'Your refund has been processed',
          lastMessageAt: '2024-01-11T14:00:00',
          createdAt: '2024-01-09', updatedAt: '2024-01-11'
        },
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Handle room selection change with proper async pattern
  const handleRoomSelect = useCallback((roomId: string | null) => {
    setSelectedRoom(roomId);
    if (roomId && roomId !== prevSelectedRoomRef.current) {
      // Use setTimeout to defer state update to next tick
      setTimeout(() => {
        setMessages([
          { id: '1', senderId: 'support', senderName: 'Support Team', content: 'Hello! Your project has been started.', createdAt: '2024-01-15T09:00:00' },
          { id: '2', senderId: user?.id || '1', senderName: user?.name || 'You', content: 'Great! Can you give me an update on the progress?', createdAt: '2024-01-15T09:30:00' },
          { id: '3', senderId: 'support', senderName: 'Support Team', content: 'We\'re currently processing the first batch. Should be ready in about 2 hours.', createdAt: '2024-01-15T10:00:00' },
          { id: '4', senderId: 'support', senderName: 'Support Team', content: 'First batch is ready for review. Please check the deliverables section.', createdAt: '2024-01-15T10:30:00' },
        ]);
      }, 0);
    }
    prevSelectedRoomRef.current = roomId;
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedRoom) return;
    const newMessage = {
      id: Date.now().toString(),
      senderId: user?.id || '1',
      senderName: user?.name || 'You',
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'PROJECT': return <Folder className="w-4 h-4" />;
      case 'SUPPORT': return <HeadphonesIcon className="w-4 h-4" />;
      case 'TEAM': return <Users className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const totalUnread = rooms.reduce((acc, r) => acc + (r.unread || 0), 0);

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Messages</h1>
            <p className="text-muted-foreground">
              {totalUnread > 0 ? `You have ${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <Button variant="outline" className="border-border">
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-60 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-60 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="glass-card">
                <CardHeader className="pb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-9 bg-muted/30 dark:bg-white/5 border-border"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y divide-white/5">
                      {rooms.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => handleRoomSelect(room.id)}
                          className={`w-full p-4 text-left hover:bg-muted/30 dark:bg-white/5 transition-colors ${
                            selectedRoom === room.id ? 'bg-muted/30 dark:bg-white/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              room.type === 'PROJECT' ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' :
                              room.type === 'SUPPORT' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-500/20 text-muted-foreground'
                            }`}>
                              {getRoomIcon(room.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm truncate">{room.name}</h4>
                                {room.unread && room.unread > 0 && (
                                  <Badge className="bg-emerald-500 text-foreground text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                    {room.unread}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {room.lastMessageAt ? formatDateTime(room.lastMessageAt) : 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              {selectedRoom ? (
                <Card className="glass-card h-[600px] flex flex-col">
                  <CardHeader className="pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        rooms.find(r => r.id === selectedRoom)?.type === 'PROJECT' 
                          ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-500/20 text-muted-foreground'
                      }`}>
                        {getRoomIcon(rooms.find(r => r.id === selectedRoom)?.type || 'DIRECT')}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {rooms.find(r => r.id === selectedRoom)?.name}
                        </CardTitle>
                        <CardDescription>
                          {rooms.find(r => r.id === selectedRoom)?.type === 'PROJECT' 
                            ? 'Project conversation' 
                            : 'Direct message'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${
                              msg.senderId === user?.id
                                ? 'bg-emerald-500/30 dark:bg-emerald-500/20 rounded-l-xl rounded-tr-xl'
                                : 'bg-white/10 rounded-r-xl rounded-tl-xl'
                            } p-4`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-medium ${
                                  msg.senderId === user?.id ? 'text-emerald-400' : 'text-foreground/80'
                                }`}>
                                  {msg.senderName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(msg.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="border-border shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500"
                        />
                        <Button
                          onClick={handleSendMessage}
                          size="icon"
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card h-[600px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
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

// ============================================
// EXPORTS
// ============================================

export {
  getStatusColor,
  getPriorityBadge,
  getStatusLabel,
  formatDate,
  formatDateTime,
  formatCurrency,
  formatBytes,
};

// ============================================
// CLIENT PAGES WRAPPER
// ============================================
// This wrapper component routes to the correct client page based on the current path
export function ClientPages() {
  const { currentPage, user } = useAppStore();
  
  // Dashboard
  if (currentPage === '/dashboard' || currentPage === '/') {
    return <div className="pt-16"><ClientDashboard /></div>;
  }
  
  // Order Builder
  if (currentPage.startsWith('/brief')) {
    return <div className="pt-16"><OrderBuilder /></div>;
  }
  
  // Projects List
  if (currentPage === '/projects' || currentPage === '/orders') {
    return <div className="pt-16"><ProjectsList /></div>;
  }
  
  // Project Detail
  if (currentPage.startsWith('/projects/') || currentPage.startsWith('/orders/')) {
    return <div className="pt-16"><ProjectDetail /></div>;
  }
  
  // Billing
  if (currentPage === '/billing') {
    return <div className="pt-16"><BillingPage /></div>;
  }
  
  // Support
  if (currentPage === '/support') {
    return <div className="pt-16"><SupportPage /></div>;
  }
  
  // Messages
  if (currentPage === '/messages') {
    return <div className="pt-16"><MessagesPage /></div>;
  }
  
  // Assets / File Manager
  if (currentPage === '/assets') {
    return <div className="pt-16"><AssetsPage /></div>;
  }
  
  // Profile
  if (currentPage === '/profile') {
    return <div className="pt-16"><ProfilePage /></div>;
  }
  
  // Default to dashboard
  return <div className="pt-16"><ClientDashboard /></div>;
}
