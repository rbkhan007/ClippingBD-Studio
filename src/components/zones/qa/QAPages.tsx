'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, AlertCircle, Eye, Clock, ArrowRight,
  RefreshCw, MessageSquare, ThumbsUp, ThumbsDown, ZoomIn,
  ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2,
  PenTool, Square, Circle, ArrowUpRight, RotateCcw, Download,
  ExternalLink, Code, Globe, Monitor, Tablet, Smartphone,
  GitBranch, FileCode, AlertTriangle, Shield, Check, X,
  Send, ArrowUpDown, Filter, Search, User, Calendar, Flag,
  Zap, Layers, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GlassCard, GlassCardStats } from '@/components/ui/glass-card';
import { useAppStore } from '@/store/app-store';
import { useApi, apiPost } from '@/hooks/use-api';

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

// Types
interface QAItem {
  id: string;
  orderId: string;
  title: string;
  editor: string | { id: string; name: string; avatar?: string };
  department: string;
  submittedAt: string;
  images: number | null;
  priority: string;
  deadline: string | null;
  type: string;
  thumbnail?: string;
  beforeImage?: string;
  afterImage?: string;
}

interface RevisionItem {
  id: string;
  orderId: string;
  title: string;
  editor: { id: string; name: string };
  feedback: string;
  round: number;
  status: 'IN_PROGRESS' | 'RESUBMITTED' | 'ESCALATED';
  deadline: string;
  qaScore: number;
}

interface Annotation {
  id: string;
  type: 'circle' | 'rectangle' | 'arrow' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

interface WebReviewItem {
  id: string;
  orderId: string;
  name: string;
  framework: string;
  previewUrl: string;
  repoUrl?: string;
  status: 'DRAFT' | 'DEVELOPMENT' | 'PREVIEW' | 'LIVE';
  lastDeployed?: string;
  pages: { path: string; name: string }[];
}

// Mock data
const mockPendingQA: QAItem[] = [
  { id: '1', orderId: 'ORD-4521', title: 'Product Clipping Path', editor: { id: 'e1', name: 'John D.' }, department: 'CLIPPING_PATH', submittedAt: '10 min ago', images: 50, priority: 'STANDARD', deadline: null, type: 'image' },
  { id: '2', orderId: 'ORD-4522', title: 'Portrait Retouching', editor: { id: 'e2', name: 'Sarah M.' }, department: 'RETOUCHING', submittedAt: '25 min ago', images: 15, priority: 'EXPRESS', deadline: null, type: 'image' },
  { id: '3', orderId: 'ORD-4523', title: 'E-commerce Color Correction', editor: { id: 'e3', name: 'Mike R.' }, department: 'COLOR_CORRECTION', submittedAt: '1h ago', images: 80, priority: 'NITRO', deadline: null, type: 'image' },
  { id: '4', orderId: 'ORD-4524', title: 'Background Removal Batch', editor: { id: 'e4', name: 'Lisa P.' }, department: 'CLIPPING_PATH', submittedAt: '2h ago', images: 120, priority: 'STANDARD', deadline: null, type: 'image' },
];

const mockRevisionItems: RevisionItem[] = [
  { id: '1', orderId: 'ORD-4518', title: 'Background Removal', editor: { id: 'e1', name: 'Alex K.' }, feedback: 'Edges need refinement on product shadows', round: 2, status: 'IN_PROGRESS', deadline: '2h', qaScore: 6 },
  { id: '2', orderId: 'ORD-4515', title: 'Fashion Retouching', editor: { id: 'e2', name: 'Lisa P.' }, feedback: 'Skin tone consistency across batch', round: 1, status: 'RESUBMITTED', deadline: '4h', qaScore: 7 },
  { id: '3', orderId: 'ORD-4510', title: 'Product Photography', editor: { id: 'e3', name: 'John D.' }, feedback: 'Color accuracy issues in shadows', round: 3, status: 'ESCALATED', deadline: '1h', qaScore: 5 },
];

const mockWebReviews: WebReviewItem[] = [
  { id: '1', orderId: 'WEB-001', name: 'E-commerce Storefront', framework: 'Next.js', previewUrl: 'https://preview.example.com', repoUrl: 'https://github.com/example/store', status: 'PREVIEW', lastDeployed: '2h ago', pages: [{ path: '/', name: 'Home' }, { path: '/products', name: 'Products' }, { path: '/cart', name: 'Cart' }] },
  { id: '2', orderId: 'WEB-002', name: 'Portfolio Website', framework: 'React', previewUrl: 'https://portfolio.example.com', status: 'DEVELOPMENT', pages: [{ path: '/', name: 'Home' }, { path: '/work', name: 'Work' }] },
];

// Role access indicator component
function RoleAccessIndicator({ requiredRole, currentRole }: { requiredRole: string; currentRole: string }) {
  const roleHierarchy: Record<string, number> = {
    GUEST: 0, CLIENT: 1, EDITOR: 2, QA: 3, ADMIN: 4, DEVELOPER: 5
  };
  
  const hasAccess = roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 text-xs ${hasAccess ? 'text-emerald-400' : 'text-red-400'}`}>
            <Shield className="w-3 h-3" />
            {hasAccess ? 'Access' : 'Restricted'}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Required: {requiredRole} | Your role: {currentRole}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// QA Queue Component
export function QAQueue() {
  const [selectedItem, setSelectedItem] = useState<QAItem | null>(null);
  const [qualityScores, setQualityScores] = useState<Record<string, number[]>>({});
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [realtimeIndicator, setRealtimeIndicator] = useState(false);
  const { user } = useAppStore();

  // Fetch QA queue from API
  const { data: qaData, loading, refetch } = useApi<{
    queue: Array<{
      id: string;
      orderId: string;
      status: string;
      department: string;
      deadline: string | null;
      payoutAmount: number | null;
      order?: {
        id: string;
        orderNumber: string;
        title: string;
        priority: string;
        deadline: string | null;
        client?: { id: string; name: string; email: string };
      };
      editor?: { id: string; name: string; email: string; avatar: string | null };
    }>;
    stats: { pending: number; reviewed: number };
  }>({ url: '/api/qa' });

  // Transform API data to QAItem format
  const queueItems: QAItem[] = (qaData?.queue || []).map(task => ({
    id: task.id,
    orderId: task.order?.orderNumber || task.orderId,
    title: task.order?.title || 'Untitled',
    editor: task.editor?.name || 'Unknown',
    priority: task.order?.priority || 'STANDARD',
    deadline: task.deadline,
    status: 'pending',
    type: task.department.includes('WEB') ? 'web' : 'image',
    department: task.department || 'CLIPPING_PATH',
    submittedAt: 'recently',
    images: null,
  }));

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeIndicator(true);
      setTimeout(() => setRealtimeIndicator(false), 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = queueItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleScoreChange = useCallback((itemId: string, value: number[]) => {
    setQualityScores(prev => ({ ...prev, [itemId]: value }));
  }, []);

  const handleApprove = async (item: QAItem) => {
    const result = await apiPost('/api/qa', {
      taskId: item.id,
      orderId: item.orderId,
      status: 'APPROVED',
      score: qualityScores[item.id]?.[0] || 8,
      feedback,
    });
    if (!result.error) {
      await refetch();
      setSelectedItem(null);
      setFeedback('');
    }
  };

  const handleReject = async (item: QAItem) => {
    const result = await apiPost('/api/qa', {
      taskId: item.id,
      orderId: item.orderId,
      status: 'REJECTED',
      score: qualityScores[item.id]?.[0] || 5,
      feedback,
    });
    if (!result.error) {
      await refetch();
      setSelectedItem(null);
      setFeedback('');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'NITRO':
        return <Badge className="badge-premium nitro-glow"><Zap className="w-3 h-3 mr-1" />NITRO</Badge>;
      case 'EXPRESS':
        return <Badge className="badge-premium bg-amber-500/20 text-amber-400"><Clock className="w-3 h-3 mr-1" />EXPRESS</Badge>;
      default:
        return <Badge className="badge-premium">STANDARD</Badge>;
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold gradient-text">QA Master Queue</h1>
              <div className={`w-2 h-2 rounded-full ${realtimeIndicator ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'} transition-colors`} />
            </div>
            <p className="text-muted-foreground">Review and approve submitted work</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="QA" currentRole={user?.role || 'GUEST'} />
            <Badge className="badge-premium px-4 py-2">
              {queueItems.length} Pending Review
            </Badge>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Pending Review"
              value={queueItems.length}
              icon={Eye}
              trend="neutral"
              className="hover:border-emerald-500"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Nitro Tasks"
              value={queueItems.filter(i => i.priority === 'NITRO').length}
              icon={Zap}
              trend="up"
              trendValue="Priority"
              className="hover:border-red-500/30"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Total Images"
              value={queueItems.reduce((sum, i) => sum + (i.images || 0), 0)}
              icon={ImageIcon}
              trend="neutral"
              className="hover:border-cyan-500/30"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <GlassCardStats
              title="Departments"
              value={new Set(queueItems.map(i => i.department)).size}
              icon={Layers}
              trend="neutral"
              className="hover:border-purple-500/30"
            />
          </motion.div>
        </motion.div>

        {/* Filters */}
        <GlassCard variant="default" padding="md" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 dark:bg-white/5 border-border hover:border-emerald-500"
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-48 bg-muted/30 dark:bg-white/5 border-border hover:border-emerald-500">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="NITRO">Nitro</SelectItem>
                <SelectItem value="EXPRESS">Express</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Queue Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar pr-2 pb-4">
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  variants={slideInLeft}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ delay: idx * 0.05 }}
                >
                  <GlassCard 
                    variant="service"
                    padding="none"
                    className={`cursor-pointer group ${
                      selectedItem?.id === item.id ? 'border-emerald-500 glow-emerald' : 'hover:border-border/80'
                    } ${item.priority === 'NITRO' ? 'nitro-glow' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground font-mono">{item.orderId}</span>
                            <Badge className="badge-premium text-xs">
                              {item.department.replace('_', ' ')}
                            </Badge>
                            {getPriorityBadge(item.priority)}
                          </div>
                          <h3 className="font-semibold group-hover:text-emerald-600 dark:text-emerald-400 transition-colors gradient-text">{item.title}</h3>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.submittedAt}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{typeof item.editor === 'string' ? item.editor : item.editor.name}</span>
                        </div>
                        <span className="font-medium text-emerald-400">{item.images} images</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Inspector Panel */}
          <GlassCard variant="neon-border" padding="none" className="sticky top-24 h-fit">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold gradient-text">Inspector</h3>
                </div>
                <Badge className="badge-premium">Review Mode</Badge>
              </div>
            </div>
            <div className="p-6">
              {selectedItem ? (
                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 dark:bg-white/5">
                    <div>
                      <p className="font-medium">{selectedItem.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedItem.orderId} • {typeof selectedItem.editor === 'string' ? selectedItem.editor : selectedItem.editor.name}</p>
                    </div>
                    {getPriorityBadge(selectedItem.priority)}
                  </div>

                  {/* Preview Placeholder */}
                  <div className="aspect-video rounded-lg bg-slate-800/50 flex items-center justify-center border border-border relative overflow-hidden">
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 border-r border-border flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <p className="text-xs mb-1">BEFORE</p>
                          <ZoomIn className="w-6 h-6 mx-auto" />
                        </div>
                      </div>
                      <div className="w-1/2 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <p className="text-xs mb-1">AFTER</p>
                          <ZoomIn className="w-6 h-6 mx-auto" />
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute bottom-2 right-2 border-border"
                      onClick={() => {/* Open in QA Review */}}
                    >
                      <Maximize2 className="w-4 h-4 mr-1" />
                      Full Review
                    </Button>
                  </div>

                  {/* Quality Score Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-emerald-400" />
                        Quality Score
                      </Label>
                      <span className="text-2xl font-bold text-emerald-400">
                        {(qualityScores[selectedItem.id] || [8])[0]}
                      </span>
                    </div>
                    <Slider
                      value={qualityScores[selectedItem.id] || [8]}
                      onValueChange={(value) => handleScoreChange(selectedItem.id, value)}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Poor</span>
                      <span>Acceptable</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  {/* Score Categories */}
                  <div className="grid grid-cols-3 gap-2">
                    {['Accuracy', 'Speed', 'Quality'].map((cat) => (
                      <div key={cat} className="text-center p-2 rounded-lg bg-muted/30 dark:bg-white/5">
                        <p className="text-xs text-muted-foreground mb-1">{cat}</p>
                        <Slider defaultValue={[7]} max={10} step={1} className="w-full" />
                      </div>
                    ))}
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      Feedback (if rejected)
                    </Label>
                    <Textarea
                      placeholder="Describe issues for revision..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="bg-muted/30 dark:bg-white/5 border-border resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleReject(selectedItem)}
                      disabled={!feedback}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                      onClick={() => handleApprove(selectedItem)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select an item from the queue to inspect</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// QA Review Component with Split-screen and Annotation Tools
export function QAReview() {
  const [currentImage, setCurrentImage] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationMode, setAnnotationMode] = useState<'none' | 'circle' | 'rectangle' | 'arrow' | 'text'>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualityScore, setQualityScore] = useState([8]);
  const [feedback, setFeedback] = useState('');
  const { user } = useAppStore();

  const totalImages = 12; // Mock total

  // Mock image navigation
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % totalImages);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + totalImages) % totalImages);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextImage, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const clearAnnotations = () => setAnnotations([]);

  const annotationTools = [
    { type: 'circle' as const, icon: Circle, label: 'Circle' },
    { type: 'rectangle' as const, icon: Square, label: 'Rectangle' },
    { type: 'arrow' as const, icon: ArrowUpRight, label: 'Arrow' },
    { type: 'text' as const, icon: PenTool, label: 'Text' },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">QA Review</h1>
            <p className="text-muted-foreground">Split-screen comparison with annotation tools</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="QA" currentRole={user?.role || 'GUEST'} />
            <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
              ORD-4521
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Review Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Toolbar */}
            <Card className="glass-card">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Annotation Tools */}
                    <div className="flex items-center gap-1 mr-4">
                      {annotationTools.map((tool) => (
                        <TooltipProvider key={tool.type}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={annotationMode === tool.type ? 'default' : 'ghost'}
                                size="sm"
                                className={annotationMode === tool.type ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : ''}
                                onClick={() => setAnnotationMode(annotationMode === tool.type ? 'none' : tool.type)}
                              >
                                <tool.icon className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{tool.label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      <Separator orientation="vertical" className="h-6 mx-2" />
                      <Button variant="ghost" size="sm" onClick={clearAnnotations}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* View Controls */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={prevImage}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-mono min-w-[60px] text-center">
                        {currentImage + 1} / {totalImages}
                      </span>
                      <Button variant="ghost" size="sm" onClick={nextImage}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Before/After Comparison */}
            <Card className={`glass-card overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
              <div className="relative aspect-[4/3] bg-card">
                {/* Before Image (Left side) */}
                <div 
                  className="absolute inset-0 flex items-center justify-center border-r-2 border-emerald-500"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium mb-2">BEFORE</p>
                    <p className="text-sm">Original Image {currentImage + 1}</p>
                  </div>
                </div>

                {/* After Image (Right side) */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                >
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium mb-2">AFTER</p>
                    <p className="text-sm">Result Image {currentImage + 1}</p>
                  </div>
                </div>

                {/* Slider Control */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-emerald-500 cursor-ew-resize z-10"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <ArrowUpDown className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Slider Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />

                {/* Annotations Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {annotations.map((ann) => (
                    <g key={ann.id}>
                      {ann.type === 'circle' && (
                        <circle cx={ann.x} cy={ann.y} r={20} fill="none" stroke={ann.color} strokeWidth="2" />
                      )}
                      {ann.type === 'rectangle' && (
                        <rect x={ann.x} y={ann.y} width={ann.width || 40} height={ann.height || 30} fill="none" stroke={ann.color} strokeWidth="2" />
                      )}
                    </g>
                  ))}
                </svg>
              </div>

              {/* Image Thumbnails */}
              <div className="p-3 bg-muted/30 dark:bg-white/5 border-t border-border">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar">
                  {Array.from({ length: totalImages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg bg-slate-800 border-2 transition-all ${
                        currentImage === idx ? 'border-emerald-500' : 'border-transparent hover:border-emerald-500'
                      }`}
                    >
                      <span className="text-xs text-muted-foreground">{idx + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quality Score */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quality Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Overall Score</Label>
                    <span className="text-2xl font-bold text-emerald-400">{qualityScore[0]}/10</span>
                  </div>
                  <Slider value={qualityScore} onValueChange={setQualityScore} max={10} step={1} />
                </div>

                {/* Category Scores */}
                {[
                  { label: 'Edge Quality', value: 8 },
                  { label: 'Color Accuracy', value: 7 },
                  { label: 'Detail Preservation', value: 9 },
                  { label: 'Consistency', value: 8 },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground flex-1">{cat.label}</span>
                    <Slider defaultValue={[cat.value]} max={10} step={1} className="w-20" />
                    <span className="text-sm font-mono w-6">{cat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your feedback..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="bg-muted/30 dark:bg-white/5 border-border resize-none"
                  rows={4}
                />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Annotations List */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-emerald-400" />
                  Annotations ({annotations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {annotations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Click an annotation tool and draw on the image
                  </p>
                ) : (
                  <div className="space-y-2">
                    {annotations.map((ann) => (
                      <div key={ann.id} className="flex items-center justify-between p-2 rounded bg-muted/30 dark:bg-white/5">
                        <span className="text-sm capitalize">{ann.type}</span>
                        <Button variant="ghost" size="sm">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// QA Web Review Component
export function QAWebReview() {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedPage, setSelectedPage] = useState('/');
  const [codeView, setCodeView] = useState<'html' | 'css' | 'js'>('html');
  const { user } = useAppStore();

  const deviceSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full',
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Web Project Review</h1>
            <p className="text-muted-foreground">Preview and code review for web projects</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="QA" currentRole={user?.role || 'GUEST'} />
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <Globe className="w-3 h-3 mr-1" />
              WEB-001
            </Badge>
          </div>
        </div>

        {/* Project Info */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">E-commerce Storefront</span>
              </div>
              <Badge variant="outline">Next.js</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitBranch className="w-4 h-4" />
                <span>main</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" className="border-border">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Live Preview
                </Button>
                <Button variant="outline" size="sm" className="border-border">
                  <Code className="w-4 h-4 mr-1" />
                  Repository
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Pages */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 p-3 pt-0">
                  {[
                    { path: '/', name: 'Home', status: 'ready' },
                    { path: '/products', name: 'Products', status: 'ready' },
                    { path: '/products/[id]', name: 'Product Detail', status: 'ready' },
                    { path: '/cart', name: 'Cart', status: 'issues' },
                    { path: '/checkout', name: 'Checkout', status: 'pending' },
                    { path: '/account', name: 'Account', status: 'ready' },
                  ].map((page) => (
                    <button
                      key={page.path}
                      onClick={() => setSelectedPage(page.path)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedPage === page.path
                          ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400'
                          : 'hover:bg-muted/30 dark:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{page.name}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          page.status === 'ready' ? 'bg-emerald-400' :
                          page.status === 'issues' ? 'bg-amber-400' : 'bg-slate-400'
                        }`} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{page.path}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-muted/30 dark:bg-white/5 border border-border">
                  <TabsTrigger value="preview" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                    <Monitor className="w-4 h-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                    <Code className="w-4 h-4 mr-2" />
                    Code Review
                  </TabsTrigger>
                  <TabsTrigger value="checklist" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Checklist
                  </TabsTrigger>
                </TabsList>

                {/* Device Switcher */}
                {activeTab === 'preview' && (
                  <div className="flex items-center gap-1 bg-muted/30 dark:bg-white/5 rounded-lg p-1">
                    <Button
                      variant={selectedDevice === 'desktop' ? 'default' : 'ghost'}
                      size="sm"
                      className={selectedDevice === 'desktop' ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : ''}
                      onClick={() => setSelectedDevice('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedDevice === 'tablet' ? 'default' : 'ghost'}
                      size="sm"
                      className={selectedDevice === 'tablet' ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : ''}
                      onClick={() => setSelectedDevice('tablet')}
                    >
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedDevice === 'mobile' ? 'default' : 'ghost'}
                      size="sm"
                      className={selectedDevice === 'mobile' ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : ''}
                      onClick={() => setSelectedDevice('mobile')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Preview Tab */}
              <TabsContent value="preview">
                <Card className="glass-card overflow-hidden">
                  <div className="bg-slate-800 p-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex-1 bg-card rounded px-3 py-1 text-sm text-muted-foreground">
                      {selectedPage}
                    </div>
                  </div>
                  <div className={`aspect-video bg-card flex items-center justify-center transition-all duration-300 ${deviceSizes[selectedDevice]} mx-auto`}>
                    <div className="text-center text-muted-foreground">
                      <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Website Preview</p>
                      <p className="text-sm mt-1">{selectedPage}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Code Review Tab */}
              <TabsContent value="code">
                <Card className="glass-card">
                  <div className="flex items-center border-b border-border">
                    {(['html', 'css', 'js'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setCodeView(lang)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          codeView === lang
                            ? 'text-emerald-400 border-b-2 border-emerald-400'
                            : 'text-muted-foreground hover:text-white'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <CardContent className="p-0">
                    <pre className="p-4 text-sm font-mono overflow-x-auto custom-scrollbar">
                      <code className="text-foreground/80">
{codeView === 'html' ? `<!-- ${selectedPage} Page -->
<div className="container mx-auto px-4">
  <header className="py-6">
    <nav className="flex items-center justify-between">
      <Logo />
      <Navigation />
      <CartButton />
    </nav>
  </header>
  <main>
    {/* Page content */}
  </main>
</div>` : codeView === 'css' ? `/* ${selectedPage} Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}` : `// ${selectedPage} JavaScript
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return <div>Content</div>;
}`}
                      </code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Checklist Tab */}
              <TabsContent value="checklist">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>QA Checklist</CardTitle>
                    <CardDescription>Verify all requirements before approval</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Responsive design works on all devices', checked: true },
                      { label: 'All images are optimized', checked: true },
                      { label: 'Navigation works correctly', checked: true },
                      { label: 'Forms validate input properly', checked: false },
                      { label: 'No console errors', checked: false },
                      { label: 'Accessibility standards met', checked: false },
                      { label: 'Performance is acceptable', checked: true },
                      { label: 'SEO meta tags present', checked: false },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 dark:bg-white/5">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${
                          item.checked ? 'bg-emerald-500' : 'border border-border/80'
                        }`}>
                          {item.checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={item.checked ? 'text-foreground/80' : 'text-muted-foreground'}>{item.label}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Quality Score</Label>
                  <Slider defaultValue={[8]} max={10} step={1} className="w-24" />
                  <span className="font-mono">8/10</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Request Changes
                </Button>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// QA Revisions Component
export function QARevisions() {
  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>(mockRevisionItems);
  const [selectedItem, setSelectedItem] = useState<RevisionItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { user } = useAppStore();

  const filteredItems = revisionItems.filter(item => 
    filterStatus === 'all' || item.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">In Progress</Badge>;
      case 'RESUBMITTED':
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Resubmitted</Badge>;
      case 'ESCALATED':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Escalated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Revision Loop</h1>
            <p className="text-muted-foreground">Track items requiring rework</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleAccessIndicator requiredRole="QA" currentRole={user?.role || 'GUEST'} />
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-2">
              {revisionItems.length} In Revision
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Revisions', value: revisionItems.length, color: 'text-white' },
            { label: 'In Progress', value: revisionItems.filter(i => i.status === 'IN_PROGRESS').length, color: 'text-amber-400' },
            { label: 'Resubmitted', value: revisionItems.filter(i => i.status === 'RESUBMITTED').length, color: 'text-cyan-400' },
            { label: 'Escalated', value: revisionItems.filter(i => i.status === 'ESCALATED').length, color: 'text-red-400' },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold {stat.color}">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 bg-muted/30 dark:bg-white/5 border-border">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESUBMITTED">Resubmitted</SelectItem>
              <SelectItem value="ESCALATED">Escalated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Revision Items */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className={`glass-card cursor-pointer transition-all ${
                      selectedItem?.id === item.id ? 'border-amber-500/50' : 'border-amber-500/30 hover:border-amber-500/50'
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground font-mono">{item.orderId}</span>
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                              Round {item.round}
                            </Badge>
                            {getStatusBadge(item.status)}
                          </div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">Assigned to: {item.editor.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className={`w-5 h-5 ${
                            item.status === 'IN_PROGRESS' ? 'text-amber-400 animate-spin' : 'text-muted-foreground'
                          }`} style={{ animationDuration: '3s' }} />
                        </div>
                      </div>

                      <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-4 mb-4">
                        <p className="text-sm text-foreground/80">
                          <MessageSquare className="w-4 h-4 inline mr-2 text-amber-400" />
                          <strong>QA Feedback:</strong> {item.feedback}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Deadline: {item.deadline}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">QA Score:</span>
                            <span className={`font-bold ${getScoreColor(item.qaScore)}`}>{item.qaScore}/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Detail Panel */}
          <Card className="glass-card sticky top-24 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Revision Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
                <div className="space-y-6">
                  {/* Status Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Status Timeline</h4>
                    <div className="relative pl-6 space-y-4">
                      {[
                        { time: '2h ago', status: 'Revision Requested', active: true },
                        { time: '1h ago', status: 'Editor Assigned', active: true },
                        { time: 'Now', status: 'In Progress', active: selectedItem.status === 'IN_PROGRESS' },
                      ].map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${
                            step.active ? 'bg-emerald-400' : 'bg-slate-600'
                          }`} />
                          <div className="flex items-center justify-between">
                            <span className={step.active ? 'text-white' : 'text-muted-foreground'}>{step.status}</span>
                            <span className="text-xs text-muted-foreground">{step.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Quality Score */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Previous QA Score</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={selectedItem.qaScore * 10} className="h-2" />
                      </div>
                      <span className={`text-xl font-bold ${getScoreColor(selectedItem.qaScore)}`}>
                        {selectedItem.qaScore}/10
                      </span>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Revision Feedback</h4>
                    <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-4">
                      <p className="text-sm text-foreground/80">{selectedItem.feedback}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 border-border">
                      View Original
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600">
                      Check Progress
                    </Button>
                  </div>

                  {/* Escalate */}
                  {selectedItem.round >= 2 && (
                    <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Escalate to Admin
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a revision item to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================
// QA PAGES WRAPPER
// ============================================
// This wrapper component routes to the correct QA page based on the current path
export function QAPages() {
  const { currentPage } = useAppStore();
  
  // QA Queue
  if (currentPage === '/qa/pending' || currentPage === '/qa' || currentPage === '/qa/queue') {
    return <div className="pt-16"><QAQueue /></div>;
  }
  
  // QA Review
  if (currentPage === '/qa/review') {
    return <div className="pt-16"><QAReview /></div>;
  }
  
  // QA Web Review
  if (currentPage === '/qa/web') {
    return <div className="pt-16"><QAWebReview /></div>;
  }
  
  // QA Revisions
  if (currentPage === '/qa/revisions') {
    return <div className="pt-16"><QARevisions /></div>;
  }
  
  // Default to queue
  return <div className="pt-16"><QAQueue /></div>;
}
