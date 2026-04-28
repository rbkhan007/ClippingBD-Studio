'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Layers, Palette, Video, Bot, ArrowRight, Eye, Filter,
  Image as ImageIcon, Sparkles, Maximize2, X, ChevronLeft, ChevronRight,
  Play, Clock, Award, CheckCircle, Gift, Quote, Star,
  TrendingUp, Users, Zap, Heart, LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlassCard } from '@/components/ui/glass-card';
import { useAppStore } from '@/store/app-store';
import { StarRating } from '@/components/ui/star-rating';

const categories = [
  { id: 'all', label: 'All Work', icon: Eye },
  { id: 'clipping', label: 'Clipping Path', icon: Layers },
  { id: 'retouching', label: 'Retouching', icon: Palette },
  { id: 'color', label: 'Color Grading', icon: Video },
  { id: 'ai', label: 'AI Enhancement', icon: Bot },
];

const portfolioItems = [
  {
    id: 1,
    title: 'E-commerce Product Shot',
    category: 'clipping',
    serviceType: 'IMAGE',
    description: 'Clean background removal for online store product catalog',
    client: 'Fashion Brand',
    turnaround: '24h',
    beforeImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&sat=-100&con=-10',
    afterImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  },
  {
    id: 2,
    title: 'Fashion Portrait',
    category: 'retouching',
    serviceType: 'IMAGE',
    description: 'Professional skin retouching and color grading for magazine',
    client: 'Style Magazine',
    turnaround: '48h',
    beforeImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&sat=-100',
  },
  {
    id: 3,
    title: 'Product Video Ad',
    category: 'color',
    serviceType: 'VIDEO',
    description: 'Cinematic color grading for commercial advertisement',
    client: 'Tech Startup',
    turnaround: '72h',
    beforeImageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop&sat=-100',
  },
  {
    id: 4,
    title: 'Jewelry Collection',
    category: 'clipping',
    serviceType: 'IMAGE',
    description: 'Precise clipping for complex jewelry pieces with reflection',
    client: 'Luxury Jewelry',
    turnaround: '36h',
    beforeImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&sat=-100',
  },
  {
    id: 5,
    title: 'Portrait Enhancement',
    category: 'ai',
    serviceType: 'IMAGE',
    description: 'AI-powered upscaling and restoration of vintage photo',
    client: 'Family Archive',
    turnaround: '12h',
    beforeImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&sat=-100',
  },
  {
    id: 6,
    title: 'Social Media Reel',
    category: 'color',
    serviceType: 'VIDEO',
    description: 'Engaging short-form content creation for Instagram',
    client: 'Lifestyle Brand',
    turnaround: '24h',
    beforeImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&sat=-100',
  },
  {
    id: 7,
    title: 'Product Background',
    category: 'clipping',
    serviceType: 'IMAGE',
    description: 'Multiple background options for A/B testing',
    client: 'E-commerce Store',
    turnaround: '18h',
    beforeImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=600&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=600&fit=crop&sat=-100',
  },
  {
    id: 8,
    title: 'Real Estate Photo',
    category: 'retouching',
    serviceType: 'IMAGE',
    description: 'HDR blending and sky replacement for property listing',
    client: 'Real Estate Agency',
    turnaround: '24h',
    beforeImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&sat=-100',
  },
  {
    id: 9,
    title: 'Old Photo Restoration',
    category: 'ai',
    serviceType: 'IMAGE',
    description: 'AI-powered restoration of damaged vintage photograph',
    client: 'Private Client',
    turnaround: '24h',
    beforeImageUrl: 'https://images.unsplash.com/photo-1491553895911-0055uj8d53fa?w=800&h=600&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1491553895911-0055uj8d53fa?w=800&h=600&fit=crop&sat=-100',
  },
];

// Client testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Williams',
    role: 'E-commerce Director',
    company: 'Fashion Forward',
    avatar: '',
    rating: 5,
    text: 'ClippingBD has transformed our product photography workflow. What used to take our in-house team days now takes hours. The quality is consistently excellent.',
    projectType: 'Background Removal',
    imageCount: '50,000+',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Creative Director',
    company: 'Digital Dreams Agency',
    avatar: '',
    rating: 4.5,
    text: 'We\'ve tried many image editing services, but ClippingBD stands out for their attention to detail and fast turnaround. Our clients love the results.',
    projectType: 'Photo Retouching',
    imageCount: '25,000+',
  },
  {
    id: 3,
    name: 'Emma Thompson',
    role: 'Marketing Manager',
    company: 'TechGear Inc.',
    avatar: '',
    rating: 4.8,
    text: 'The AI enhancement feature saved our old product photos. We didn\'t have to reshoot anything - they made our archive look brand new.',
    projectType: 'AI Enhancement',
    imageCount: '10,000+',
  },
  {
    id: 4,
    name: 'David Rodriguez',
    role: 'Studio Owner',
    company: 'Rodriguez Photography',
    avatar: '',
    rating: 4.2,
    text: 'As a photographer, I\'m very particular about my edits. ClippingBD understands my vision and delivers exactly what I need, every time.',
    projectType: 'Portrait Retouching',
    imageCount: '15,000+',
  },
  {
    id: 5,
    name: 'Lisa Wang',
    role: 'Operations Lead',
    company: 'Global Retail Co.',
    avatar: '',
    rating: 5,
    text: 'Their API integration made it seamless to incorporate into our existing workflow. The automation has saved us countless hours of manual work.',
    projectType: 'API Integration',
    imageCount: '100,000+',
  },
  {
    id: 6,
    name: 'James Cooper',
    role: 'Video Producer',
    company: 'CineMedia Studios',
    avatar: '',
    rating: 5,
    text: 'Video editing at this quality and speed is rare. ClippingBD has become our go-to for all post-production color grading work.',
    projectType: 'Video Color Grading',
    imageCount: '500+ videos',
  },
];

// Animated counter component
function AnimatedCounter({ end, duration = 2000, label, icon: Icon, suffix = '', prefix = '' }: {
  end: number;
  duration?: number;
  label: string;
  icon: LucideIcon;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <GlassCard variant="stat" className="text-center">
        <Icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
        <div className="text-2xl font-bold gradient-text mb-1">
          {prefix}{count.toLocaleString()}{suffix}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </GlassCard>
    </motion.div>
  );
}

// Before/After Slider Component
function BeforeAfterSlider({ 
  beforeGradient, 
  afterGradient, 
  beforeImage,
  afterImage,
  onExpand 
}: { 
  beforeGradient: string; 
  afterGradient: string;
  beforeImage?: string;
  afterImage?: string;
  onExpand?: () => void;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 5), 95);
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-t-xl overflow-hidden cursor-ew-resize select-none group"
      style={{ minHeight: '200px' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { handleMouseUp(); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* After Image */}
      <div className={`absolute inset-0 bg-gradient-to-br ${afterGradient} flex items-center justify-center`}>
        {afterImage ? (
          <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-contain" />
        ) : (
          <div className="text-center text-white">
            <motion.div className="text-4xl mb-2" animate={{ scale: isHovered ? 1.1 : 1 }}>✨</motion.div>
            <p className="text-xs font-medium opacity-90">After</p>
          </div>
        )}
      </div>

      {/* Before Image */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${beforeGradient} flex items-center justify-center`}
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {beforeImage ? (
          <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-contain" />
        ) : (
          <div className="text-center text-white">
            <motion.div className="text-4xl mb-2" animate={{ scale: isHovered ? 1.1 : 1 }}>📷</motion.div>
            <p className="text-xs font-medium opacity-90">Before</p>
          </div>
        )}
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <ChevronLeft className="w-3 h-3 text-white -mr-0.5" />
            <ChevronRight className="w-3 h-3 text-white -ml-0.5" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 z-20">
        <Badge variant="outline" className="bg-black/50 border-border text-white text-[10px]">Before</Badge>
      </div>
      <div className="absolute top-2 right-2 z-20">
        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] border-0">After</Badge>
      </div>

      {/* Expand Button */}
      {onExpand && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          onClick={(e) => { e.stopPropagation(); onExpand(); }}
          className="absolute bottom-2 right-2 z-20 w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
  );
}

// Full Screen Modal
function FullScreenSlider({ 
  item, 
  isOpen, 
  onClose 
}: { 
  item: (typeof portfolioItems[0] & { beforeImageUrl?: string; afterImageUrl?: string; beforeGradient?: string; afterGradient?: string }) | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [position, setPosition] = useState(50);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-black border-border overflow-hidden">
        <div className="relative w-full h-full">
          {/* After */}
          <div className={`absolute inset-0 bg-gradient-to-br ${item.afterGradient || 'from-green-400 to-emerald-600'} flex items-center justify-center`}>
            {item.afterImageUrl ? (
              <img src={item.afterImageUrl} alt="After" className="absolute inset-0 w-full h-full object-contain" />
            ) : (
              <div className="text-center text-white">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-xl font-medium">After</p>
              </div>
            )}
          </div>

          {/* Before */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${item.beforeGradient || 'from-red-400 to-orange-600'} flex items-center justify-center`}
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            {item.beforeImageUrl ? (
              <img src={item.beforeImageUrl} alt="Before" className="absolute inset-0 w-full h-full object-contain" />
            ) : (
              <div className="text-center text-white">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-xl font-medium">Before</p>
              </div>
            )}
          </div>

          {/* Slider */}
          <input
            type="range"
            min="5"
            max="95"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="absolute inset-y-0 w-full opacity-0 cursor-ew-resize z-30"
          />
          
          <div
            className="absolute top-0 bottom-0 w-1 bg-white z-20"
            style={{ left: `${position}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-white -mr-0.5" />
                <ChevronRight className="w-4 h-4 text-white -ml-0.5" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-30">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{item.title}</h2>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-white/80 text-xs">
                <span>Client: {item.client}</span>
                <span>Turnaround: {item.turnaround}</span>
              </div>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 text-xs">
                {item.serviceType}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbPortfolio, setDbPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/portfolio', { next: { revalidate: 60 } });
        const data = await response.json();
        if (data.success && data.portfolioItems) {
          setDbPortfolio(data.portfolioItems.map((p: any) => ({
            ...p,
            id: p.id || `portfolio-${Math.random()}`,
            description: p.description || '',
            client: p.clientName || 'Client',
            turnaround: '24h',
            beforeGradient: 'from-slate-600 to-slate-800',
            afterGradient: 'from-emerald-500 to-teal-600',
          })));
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Use database portfolio if available, otherwise fall back to static
  const displayItems = dbPortfolio.length > 0 ? dbPortfolio : portfolioItems;

  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
  };

  const filteredItems = activeCategory === 'all'
    ? displayItems
    : displayItems.filter(item => item.category === activeCategory);

  const handleExpand = (item: typeof portfolioItems[0]) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Badge className="badge-premium mb-4 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 px-4 py-1.5 glow-emerald">
              <Eye className="w-4 h-4 mr-2" />
              Our Work
            </Badge>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Project <span className="gradient-text">Portfolio</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our before/after transformations. Drag the slider to compare results.
          </p>
        </motion.div>
      </section>

      {/* Category Filter - Service Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'glass-card text-muted-foreground hover:text-white hover:border-emerald-500/30 border border-border'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Portfolio Grid - Masonry Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                className="break-inside-avoid"
              >
                <GlassCard variant="neon-border" className="overflow-hidden group mb-4">
                  <BeforeAfterSlider
                    beforeGradient={item.beforeGradient}
                    afterGradient={item.afterGradient}
                    beforeImage={item.beforeImageUrl || item.thumbnailUrl}
                    afterImage={item.afterImageUrl || item.thumbnailUrl}
                    onExpand={() => handleExpand(item)}
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                      <Badge variant="outline" className="text-[10px]">{item.serviceType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>{item.client}</span>
                      <span>•</span>
                      <span>{item.turnaround}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Stats Section with Animated Counters */}
      <section className="py-12 border-y border-border mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <Badge className="mb-3 bg-teal-500/10 border-teal-500/30 text-teal-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              Our Impact
            </Badge>
            <h2 className="text-2xl font-bold mb-2">Numbers That <span className="gradient-text">Speak</span></h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedCounter
              end={50000000}
              duration={2500}
              label="Images Processed"
              icon={ImageIcon}
              suffix="+"
            />
            <AnimatedCounter
              end={100000}
              duration={2500}
              label="Videos Edited"
              icon={Video}
              suffix="+"
            />
            <AnimatedCounter
              end={10000}
              duration={2500}
              label="Happy Clients"
              icon={Sparkles}
              suffix="+"
            />
            <AnimatedCounter
              end={999}
              duration={2500}
              label="Satisfaction Rate"
              icon={Star}
              suffix="%"
              prefix="99."
            />
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Badge className="mb-3 bg-pink-500/10 border-pink-500/30 text-pink-400">
            <Heart className="w-3 h-3 mr-1" />
            Client Love
          </Badge>
          <h2 className="text-2xl font-bold mb-2">What Our <span className="gradient-text">Clients Say</span></h2>
          <p className="text-muted-foreground text-sm">Real feedback from businesses we've helped grow</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-card h-full hover:border-emerald-500/30 transition-all duration-300 group">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10 border-2 border-emerald-500/30">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-medium">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                    </div>
                    <Quote className="w-6 h-6 text-emerald-500/30" />
                  </div>
                  
                  <div className="mb-3">
                    <StarRating rating={testimonial.rating} size="sm" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{testimonial.text}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                      {testimonial.projectType}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{testimonial.imageCount} processed</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Card className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
            <div className="relative">
              <Badge className="mb-3 bg-black/5 dark:bg-white/10 border-border text-foreground dark:text-white">
                <Gift className="w-3 h-3 mr-1" />
                Free Trial
              </Badge>
              <h2 className="text-2xl font-bold mb-3">Ready to See Your Transformation?</h2>
              <p className="text-muted-foreground mb-6 text-sm max-w-lg mx-auto">
                Join thousands of satisfied clients. Try our service with 3 free images.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25" 
                  asChild
                >
                  <a href="/auth" onClick={() => handleNavigate('/auth')}>
                    Get Started Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-border" asChild>
                  <a href="/pricing" onClick={() => handleNavigate('/pricing')}>
                    View Pricing
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Full Screen Modal */}
      <FullScreenSlider
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
