'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Image as ImageIcon, Video, Bot, ArrowRight, Play, Star, Clock, Shield,
  Zap, Users, CheckCircle, ChevronRight, Award, TrendingUp,
  Layers, Sparkles, Globe, MousePointer, Wand2, Gift, Headphones,
  RefreshCw, DollarSign, Upload, Activity, Code, Lock, CreditCard,
  Eye, Download, Settings, Edit, Store, Package, Tag, Box, ShoppingCart,
  Calculator, Palette, FileText, Layout, Home, Heart, Maximize,
  RotateCcw, Diamond, Car, Utensils, Shirt, MoveRight, Monitor, Smartphone,
  Server, Database, Cpu, PlusCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardStats, GlassCardFeature, GlassCardTestimonial, GlassCardService } from '@/components/ui/glass-card';
import { ReviewSubmitModal } from '@/components/ui/review-submit-modal';
import { useAppStore } from '@/store/app-store';
import { useNavigation } from '@/hooks/use-navigation';
import { cn } from '@/lib/utils';
import {
  useCmsHero,
  useCmsStatistics,
  useCmsFeatures,
  useCmsServices,
  useCmsTestimonials,
} from '@/hooks/realtime/use-cms-realtime';

// Simple background gradient instead of ThreeScene for stability
function BackgroundGradient() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-background to-cyan-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
    </div>
  );
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Static fallback data
const fallbackServices = [
  { title: 'Image Services', subtitle: 'Professional Photo Editing', description: 'Clipping path, retouching, color correction, and e-commerce optimization', href: '/services/image', gradient: 'from-emerald-500 to-teal-600', color: 'emerald', features: ['Clipping Path', 'Background Removal', 'Retouching', 'Color Correction'] },
  { title: 'Video Services', subtitle: 'Cinematic Video Editing', description: 'Reel editing, color grading, motion graphics, and post-production', href: '/services/video', gradient: 'from-cyan-500 to-blue-600', color: 'cyan', features: ['Video Editing', 'Color Grading', 'Motion Graphics', 'Post-Production'] },
  { title: 'AI Operations', subtitle: 'Intelligent Automation', description: 'AI-powered processing, batch operations, and custom solutions', href: '/services/ai', gradient: 'from-violet-500 to-purple-600', color: 'violet', features: ['AI Enhancement', 'Auto Masking', 'Batch Processing', 'Smart Resize'] },
  { title: 'Web Development', subtitle: 'Custom Web Solutions', description: 'Website design, e-commerce platforms, CMS integration, and web applications', href: '/services/web', gradient: 'from-orange-500 to-amber-600', color: 'orange', features: ['Web Design', 'E-commerce', 'CMS Setup', 'Web Apps'] },
];

const fallbackStats = [
  { label: 'Images Processed', value: '50M+', icon: ImageIcon, description: 'Professional quality', color: 'emerald' },
  { label: 'Videos Edited', value: '100K+', icon: Video, description: 'Cinematic results', color: 'cyan' },
  { label: 'Happy Clients', value: '10K+', icon: Users, description: 'Worldwide', color: 'violet' },
  { label: 'Countries Served', value: '120+', icon: Globe, description: 'Global reach', color: 'orange' },
];

const fallbackFeatures = [
  { title: '24-Hour Turnaround', description: 'Rush delivery available for urgent projects' },
  { title: 'Secure & Confidential', description: 'NDA signing and encrypted file transfer' },
  { title: 'Nitro Express', description: '12-hour delivery with automatic priority handling' },
  { title: 'Quality Guaranteed', description: 'Unlimited revisions until you\'re satisfied' },
];

const fallbackTestimonials = [
  { id: '1', name: 'Sarah Chen', role: 'E-commerce Director', company: 'StyleHub', content: 'ClippingBD transformed our product photography workflow. 10x faster turnaround at 1/3 the cost.', rating: 5 },
  { id: '2', name: 'Michael Torres', role: 'Creative Director', company: 'BrandVision', content: 'The quality of their retouching work is exceptional. Perfect for high-end fashion campaigns.', rating: 5 },
  { id: '3', name: 'Emma Wilson', role: 'Marketing Manager', company: 'TechGear', content: 'Their video editing team understands e-commerce. Our product videos have never looked better.', rating: 5 },
];

const processSteps = [
  { step: 1, title: 'Upload', description: 'Drag & drop your files', icon: Upload },
  { step: 2, title: 'Brief', description: 'Describe your requirements', icon: FileText },
  { step: 3, title: 'Review', description: 'We review and quote', icon: Eye },
  { step: 4, title: 'Edit', description: 'Expert editors work', icon: Wand2 },
  { step: 5, title: 'Deliver', description: 'Download your files', icon: Download },
];

const webServices = [
  { icon: Layout, title: 'Website Design', description: 'Modern, responsive designs that convert visitors to customers' },
  { icon: ShoppingCart, title: 'E-commerce', description: 'Online stores with seamless checkout experiences' },
  { icon: Database, title: 'CMS Integration', description: 'WordPress, Shopify, and custom CMS solutions' },
  { icon: Smartphone, title: 'Mobile Apps', description: 'Cross-platform mobile applications' },
  { icon: Server, title: 'Backend Dev', description: 'Scalable APIs and database architecture' },
  { icon: Cpu, title: 'AI Integration', description: 'Smart features powered by machine learning' },
];

export function HomePage() {
  const [activeService, setActiveService] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [clientReviews, setClientReviews] = useState<any[]>([]);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews?limit=6');
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setClientReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, []);

  // Fetch CMS data with realtime updates
  const { data: cmsHero } = useCmsHero();
  const { data: cmsStats } = useCmsStatistics();
  const { data: cmsFeatures } = useCmsFeatures();
  const { data: cmsServices } = useCmsServices();
  const { data: cmsTestimonials } = useCmsTestimonials();

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

  // Fetch approved client reviews
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Use CMS data or fallback
  const hero = cmsHero?.[0] || {
    headline: 'Professional Visual Content Services',
    subheadline: 'Transform Your Images & Videos with Expert Editing',
    description: 'From precision clipping paths to cinematic color grading, custom web development to AI automation — we deliver pixel-perfect results with lightning-fast turnaround.',
    ctaText: 'Start Free Trial',
    ctaUrl: '/auth',
    secondaryCtaText: 'View Portfolio',
    secondaryCtaUrl: '/portfolio',
  };

  const displayStats = cmsStats?.length > 0 ? cmsStats.map(s => ({
    label: s.label,
    value: `${s.prefix || ''}${s.value}${s.suffix || ''}`,
    icon: ImageIcon,
    description: s.description || '',
    color: 'emerald',
  })) : fallbackStats;

  const displayFeatures = cmsFeatures?.length > 0 ? cmsFeatures.map(f => ({
    title: f.title,
    description: f.description,
  })) : fallbackFeatures;

  const displayServices = cmsServices?.length > 0 ? cmsServices.map((s, i) => ({
    title: s.title,
    subtitle: s.subtitle || s.category,
    description: s.description,
    href: `/services/${s.category.toLowerCase().replace('_', '-')}`,
    gradient: ['from-emerald-500 to-teal-600', 'from-cyan-500 to-blue-600', 'from-violet-500 to-purple-600', 'from-orange-500 to-amber-600'][i % 4],
    color: ['emerald', 'cyan', 'violet', 'orange'][i % 4],
    features: s.features ? JSON.parse(s.features) : [],
  })) : fallbackServices;

  const displayReviews = clientReviews.length > 0 ? clientReviews : (cmsTestimonials?.length > 0 ? cmsTestimonials : fallbackTestimonials);

  // Auto-rotate services
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % displayServices.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayServices.length]);

  return (
    <div className="relative">
      {/* 3D Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black -z-10" />}>
        <BackgroundGradient />
      </Suspense>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent -z-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp}>
                <Badge className="badge-premium glass-card px-4 py-2 text-sm border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                  <Sparkles className="w-4 h-4 mr-2 text-emerald-400" />
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-semibold">Trusted by 10,000+ businesses</span>
                </Badge>
              </motion.div>
              
              {/* Headline */}
              <motion.div variants={fadeInUp}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1]">
                  {hero.headline.split(' ').slice(0, 2).join(' ')}{' '}
                  <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    {hero.headline.split(' ').slice(2).join(' ') || 'Services'}
                  </span>
                </h1>
              </motion.div>
              
              {/* Description */}
              <motion.p 
                variants={fadeInUp}
                className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed"
              >
                {hero.description || hero.subheadline}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap gap-4"
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 px-8 py-6 text-lg shadow-xl shadow-emerald-500/25 group"
                  onClick={() => handleNavigate(hero.ctaUrl || '/auth')}
                >
                  {hero.ctaText || 'Start Free Trial'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="glass-card px-8 py-6 text-lg border-border hover:border-emerald-500/30 group"
                  onClick={() => handleNavigate(hero.secondaryCtaUrl || '/portfolio')}
                >
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  {hero.secondaryCtaText || 'View Portfolio'}
                </Button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap gap-3 pt-4"
              >
                {['ISO 27001', 'GDPR Ready', '24/7 Support', '99.9% Uptime'].map((badge, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full text-sm border-border"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-muted-foreground">{badge}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Service Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Main Preview Card */}
              <GlassCard 
                variant="premium" 
                padding="none" 
                className="p-8 min-h-[400px] border-emerald-500/20"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                  >
                    {/* Service Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <Badge className={`bg-gradient-to-r ${displayServices[activeService].gradient} text-white border-0 mb-3`}>
                          Most Popular
                        </Badge>
                        <h3 className="text-2xl font-bold mb-1">
                          {displayServices[activeService].title}
                        </h3>
                        <p className={`text-${displayServices[activeService].color}-400`}>
                          {displayServices[activeService].subtitle}
                        </p>
                      </div>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${displayServices[activeService].gradient} flex items-center justify-center shadow-xl`}>
                        {(() => {
                          const icons = [ImageIcon, Video, Bot, Globe];
                          const Icon = icons[activeService % 4];
                          return <Icon className="w-8 h-8 text-white" />;
                        })()}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {displayServices[activeService].description}
                    </p>
                    
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {(displayServices[activeService].features || []).slice(0, 4).map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Footer Stats */}
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <div>
                        <div className="text-sm text-muted-foreground">Starting at</div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">$0.20/image</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold text-${displayServices[activeService].color}-400`}>
                          50M+
                        </div>
                        <div className="text-xs text-muted-foreground">Processed</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </GlassCard>

              {/* Service Tabs */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1 p-1.5 rounded-full glass-card overflow-x-auto max-w-full">
                {displayServices.map((service, idx) => (
                  <button
                    key={service.title}
                    onClick={() => setActiveService(idx)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                      activeService === idx
                        ? `bg-gradient-to-r ${service.gradient} text-white shadow-lg`
                        : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    {service.title.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Floating Decorative Elements */}
              <motion.div 
                className="absolute -top-6 -right-6 w-28 h-28 rounded-2xl glass-card flex items-center justify-center border-emerald-500/20"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">24h</div>
                  <div className="text-xs text-muted-foreground">Turnaround</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 -left-8 w-24 h-24 rounded-xl glass-card flex items-center justify-center border-cyan-500/20"
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">$0.20</div>
                  <div className="text-xs text-muted-foreground">Starting</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {displayStats.map((stat, idx) => (
              <motion.div key={stat.label} variants={scaleIn}>
                <GlassCard 
                  variant="stat" 
                  padding="lg" 
                  className="text-center border-emerald-500/10 hover:border-emerald-500/30 transition-all"
                >
                  <stat.icon className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
                  <div className="text-sm font-medium mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section - Updated to 4 columns */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="glass-card mb-4 px-4 py-2 border-emerald-500/20">
                <Layers className="w-4 h-4 mr-2 text-emerald-400" />
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-semibold">Our Services</span>
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Complete <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">Visual Content</span> Solutions
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From basic clipping paths to advanced AI automation and full web development, 
              we&apos;re your one-stop partner for all visual content needs.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {displayServices.map((service, idx) => {
              const icons = [ImageIcon, Video, Bot, Globe];
              return (
                <motion.div key={service.title} variants={scaleIn}>
                  <GlassCardService
                    icon={icons[idx % 4]}
                    title={service.title}
                    description={service.description}
                    gradient={service.gradient}
                    onClick={() => handleNavigate(service.href)}
                    className="h-full"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Web Development Highlight Section - NEW */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            {/* Left Content */}
            <motion.div variants={fadeInUp}>
              <Badge className="glass-card mb-4 px-4 py-2 border-orange-500/20">
                <Globe className="w-4 h-4 mr-2 text-orange-400" />
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent font-semibold">Web Development</span>
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Build Your <span className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">Digital Presence</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                We don&apos;t just edit content — we build complete digital experiences. From stunning websites 
                to powerful e-commerce platforms and custom web applications.
              </p>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 border-0 px-8 shadow-xl shadow-orange-500/25 group"
                asChild
              >
                <a href="/services/web" onClick={() => handleNavigate('/services/web')}>
                  Explore Web Services
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </motion.div>

            {/* Right - Web Services Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {webServices.map((service, idx) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <GlassCard 
                    variant="hover-lift" 
                    padding="md" 
                    className="h-full border-orange-500/10 hover:border-orange-500/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-3">
                      <service.icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <h4 className="font-semibold mb-1 text-sm">{service.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge className="glass-card mb-4 px-4 py-2 border-emerald-500/20">
                  <Zap className="w-4 h-4 mr-2 text-emerald-400" />
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-semibold">Our Promise</span>
                </Badge>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Why <span className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Industry Leaders</span> Choose Us
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-lg mb-8">
                We don&apos;t just edit images. We become an extension of your team, delivering 
                excellence at scale with guarantees that protect your business.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="space-y-4">
                {displayFeatures.map((feature, idx) => {
                  const icons = [Clock, Shield, Zap, Award];
                  const colors = ['emerald', 'cyan', 'violet', 'orange'];
                  const Icon = icons[idx % icons.length];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl glass-card border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: '99.9%', label: 'Client Satisfaction', icon: Heart, color: 'emerald' },
                { value: '24h', label: 'Avg Turnaround', icon: Clock, color: 'cyan' },
                { value: '150+', label: 'Expert Editors', icon: Users, color: 'violet' },
                { value: '5M+', label: 'Files Delivered', icon: Download, color: 'orange' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <GlassCard variant="hover-lift" padding="lg" className="text-center border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                    <item.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">{item.value}</div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="glass-card mb-4 px-4 py-2 border-emerald-500/20">
                <Activity className="w-4 h-4 mr-2 text-emerald-400" />
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-semibold">Simple Process</span>
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              How It <span className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Works</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From upload to download in just a few clicks. Our streamlined process saves you time.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-5 gap-6"
          >
            {processSteps.map((step, idx) => (
              <motion.div key={step.step} variants={scaleIn} className="relative">
                <GlassCard variant="hover-lift" padding="lg" className="text-center h-full border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold shadow-lg shadow-emerald-500/25">
                    {step.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </GlassCard>
                
                {/* Connector Arrow */}
                {idx < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-emerald-500/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="glass-card mb-4 px-4 py-2 border-amber-500/20">
                <Star className="w-4 h-4 mr-2 text-amber-400" />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent font-semibold">Client Love</span>
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              What Our <span className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">Clients Say</span>
            </motion.h2>
            <motion.div variants={fadeInUp} className="flex justify-center mt-6">
              <Button
                onClick={() => setIsReviewModalOpen(true)}
                variant="outline"
                className="glass-card border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group"
              >
                <PlusCircle className="w-4 h-4 mr-2 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-semibold">
                  Share Your Experience
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {displayReviews.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-6"
            >
              {displayReviews.slice(0, 3).map((review, idx) => (
                <motion.div key={review.id || idx} variants={scaleIn}>
                  <GlassCardTestimonial
                    quote={review.content || review.content}
                    author={review.name}
                    role={review.role || 'Client'}
                    company={review.company || 'ClippingBD User'}
                    rating={review.rating || 5}
                    avatar={review.avatarUrl || review.avatar}
                    className="h-full border-amber-500/10 hover:border-amber-500/30 transition-all"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <GlassCard variant="premium" padding="xl" className="text-center overflow-hidden border-emerald-500/20">
              {/* Inner gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
              
              <div className="relative">
                <Badge className="glass-card mb-6 px-4 py-2 border-emerald-500/20">
                  <Gift className="w-4 h-4 mr-2 text-emerald-400" />
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-semibold">Limited Time Offer</span>
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Transform Your Content?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                  Join thousands of businesses that trust ClippingBD for their editing needs.
                  Get started today with our free trial.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 px-10 py-7 text-lg shadow-xl shadow-emerald-500/25 group"
                    asChild
                  >
                    <a href="/auth" onClick={() => handleNavigate('/auth')}>
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="glass-card px-10 py-7 text-lg border-border hover:border-emerald-500/30 group"
                    asChild
                  >
                    <a href="/contact" onClick={() => handleNavigate('/contact')}>
                      Contact Sales
                    </a>
                  </Button>
                </div>
                
                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>5 free images</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Review Submission Modal */}
      <ReviewSubmitModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={fetchReviews}
      />
    </div>
  );
}
