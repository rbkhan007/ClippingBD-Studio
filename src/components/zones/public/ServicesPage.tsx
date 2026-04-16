'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Image as ImageIcon, Video, Bot, ArrowRight, CheckCircle, Clock, Zap, Shield,
  Layers, Wand2, Palette, Camera, Film, Sparkles, Braces, Database,
  ChevronRight, Globe, Code, Smartphone, ShoppingCart, Search,
  FileCode, Layers3, PenTool, Layout, Monitor, Cpu, Blocks, Star,
  Users, Award, TrendingUp, RefreshCw, Headphones, Gift, DollarSign,
  Diamond, Home, Shirt, Utensils, Heart, Car, Package, Tag, Store,
  RotateCcw, Maximize, Eye, Play, Upload, Settings, Download, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard, GlassCardService } from '@/components/ui/glass-card';
import { useAppStore } from '@/store/app-store';
import { serviceCategories, type ServiceCategory, type AdditionalService } from '@/data/public-content';

const iconMap: Record<string, any> = {
  Image: ImageIcon, Video, Bot, Layers, Globe, Sparkles, Clock, Shield, Zap, Award,
  TrendingUp, Users, Headphones, RefreshCw, DollarSign, Gift, Wand2,
  Palette, Camera, Film, Braces, Database, Code, Smartphone, ShoppingCart,
  Search, FileCode, Layers3, PenTool, Layout, Monitor, Cpu, Blocks, Star,
  Diamond, Home, Shirt, Utensils, Heart, Car, Package, Tag, Store,
  RotateCcw, Maximize, Eye, Play, Upload, Settings, Download
};

// Get icon function - moved to module scope for use by all components
const getIcon = (iconName: string) => iconMap[iconName] || Layers;

// Stats Section Data
const serviceStats = [
  { value: '50M+', label: 'Images Processed', icon: ImageIcon },
  { value: '100K+', label: 'Videos Created', icon: Video },
  { value: '99.8%', label: 'Satisfaction Rate', icon: Star },
  { value: '18h', label: 'Avg Turnaround', icon: Clock },
];

// Process Steps
const processSteps = [
  { step: 1, title: 'Upload', description: 'Drag & drop your files', icon: Upload },
  { step: 2, title: 'Specify', description: 'Tell us your requirements', icon: Settings },
  { step: 3, title: 'We Edit', description: 'Expert editors process', icon: Wand2 },
  { step: 4, title: 'Review', description: 'Preview and request revisions', icon: Eye },
  { step: 5, title: 'Download', description: 'Get your perfect files', icon: Download },
];

// Guarantees
const guarantees = [
  { icon: Shield, title: 'Quality Guarantee', description: 'Pixel-perfect results' },
  { icon: Clock, title: 'On-Time Delivery', description: 'Never miss a deadline' },
  { icon: RefreshCw, title: 'Free Revisions', description: 'Until you\'re satisfied' },
  { icon: DollarSign, title: 'Best Price', description: 'Competitive pricing' },
];

// Category filter configuration for each service page
const pageCategoryConfig: Record<string, string[]> = {
  '/services/clipping-path': ['image_editing', 'specialized', 'ecommerce'],
  '/services/image': ['specialized', 'ecommerce'],
  '/services/video': ['video_services'],
  '/services/ai': ['ai_services'],
  '/services/web': ['web_design'],
};

// Related services for cross-navigation - each service has a unique path
const relatedServicesConfig: Record<string, { title: string; description: string; path: string; icon: any; gradient: string }[]> = {
  '/services/clipping-path': [
    { title: 'Image Services', description: 'Photo retouching & e-commerce ready', path: '/services/image', icon: ImageIcon, gradient: 'from-teal-500 to-cyan-600' },
    { title: 'AI Services', description: 'Automated batch processing', path: '/services/ai', icon: Bot, gradient: 'from-blue-500 to-indigo-600' },
  ],
  '/services/image': [
    { title: 'Clipping Path', description: 'Precision background removal', path: '/services/clipping-path', icon: Layers, gradient: 'from-emerald-500 to-green-600' },
    { title: 'AI Services', description: 'Automated processing', path: '/services/ai', icon: Bot, gradient: 'from-blue-500 to-indigo-600' },
  ],
  '/services/video': [
    { title: 'AI Services', description: 'AI-powered video tools', path: '/services/ai', icon: Bot, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Web Design', description: 'Video embedding & streaming', path: '/services/web', icon: Globe, gradient: 'from-indigo-500 to-purple-600' },
  ],
  '/services/ai': [
    { title: 'Image Services', description: 'Human-edited perfection', path: '/services/image', icon: ImageIcon, gradient: 'from-teal-500 to-cyan-600' },
    { title: 'Video Services', description: 'AI video editing', path: '/services/video', icon: Video, gradient: 'from-cyan-500 to-blue-600' },
  ],
  '/services/web': [
    { title: 'Image Services', description: 'Product photos for web', path: '/services/image', icon: ImageIcon, gradient: 'from-teal-500 to-cyan-600' },
    { title: 'AI Services', description: 'Smart integrations', path: '/services/ai', icon: Bot, gradient: 'from-blue-500 to-indigo-600' },
  ],
};

export function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [dbServices, setDbServices] = useState<{name: string; slug: string; category: string; description: string; basePrice: number; turnaround: number; features: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/services');
        const data = await response.json();
        if (data.services) {
          setDbServices(data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

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

  // Group services by category
  const servicesByCategory = dbServices.reduce((acc, service) => {
    const cat = service.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, typeof dbServices>);

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
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
            <Badge className="badge-premium mb-6 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 px-4 py-1.5 glow-emerald">
              <Layers className="w-4 h-4 mr-2" />
              Professional Services
            </Badge>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Complete <span className="gradient-text">Visual Content</span> Solutions
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            From precision clipping paths to cinematic video editing and custom web development,
            we're your one-stop partner for all visual content needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="btn-premium bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25" 
              asChild
            >
              <a href="/brief/new" onClick={() => handleNavigate('/brief/new')}>
                Start Your Project
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="btn-secondary-premium border-border" asChild>
              <a href="/pricing" onClick={() => handleNavigate('/pricing')}>
                View Pricing
              </a>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {serviceStats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard variant="stat" className="text-center">
                  <stat.icon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services by Category - Tabbed */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Browse by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select a category to explore our comprehensive range of professional services.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {serviceCategories.map((category, idx) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveCategory(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === idx
                    ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                    : 'glass-card text-muted-foreground hover:text-foreground hover:border-emerald-500/30'
                }`}
              >
                {(() => {
                  const Icon = getIcon(category.icon);
                  return <Icon className="w-4 h-4" />;
                })()}
                {category.name}
              </motion.button>
            ))}
          </div>

          {/* Services Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {serviceCategories[activeCategory]?.services.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={`glass-card h-full hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group ${
                      service.popular ? 'border-emerald-500/30' : ''
                    }`}
                    onClick={() => handleNavigate('/pricing')}
                  >
                    <CardContent className="p-5 relative">
                      {service.popular && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs border-0">
                            Popular
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${serviceCategories[activeCategory].gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {(() => {
                            const Icon = getIcon(service.icon);
                            return <Icon className="w-5 h-5 text-white" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{service.title}</h3>
                          <p className="text-emerald-400 text-xs">{service.price}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                      <div className="flex items-center text-emerald-400 text-xs mt-3 group-hover:text-teal-400 transition-colors">
                        View Pricing
                        <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-teal-500/10 border-teal-500/30 text-teal-400">
              <Zap className="w-3 h-3 mr-1" />
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4">
            {processSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center relative"
              >
                <Card className="glass-card p-4 hover:border-emerald-500/30 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3 text-white font-bold shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </Card>
                {idx < processSteps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-2 w-4 h-4 text-emerald-500/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-4">
            {guarantees.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card text-center p-6 hover:border-emerald-500/30 transition-all">
                  <item.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
              <div className="relative">
                <Badge className="mb-4 bg-black/5 dark:bg-white/10 border-border text-foreground">
                  <Gift className="w-3 h-3 mr-1" />
                  Free Trial
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Try our services with 3 free images. No credit card required, no commitment.
                </p>
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25" asChild>
                  <a href="/auth" onClick={() => handleNavigate('/auth')}>
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// SHARED COMPONENT: Service Category Tabs
// ============================================
interface ServiceCategoryTabsProps {
  categories: ServiceCategory[];
  activeCategory: number;
  setActiveCategory: (idx: number) => void;
  getIcon: (name: string) => any;
}

function ServiceCategoryTabs({ categories, activeCategory, setActiveCategory, getIcon }: ServiceCategoryTabsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      {categories.map((category, idx) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => setActiveCategory(idx)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeCategory === idx
              ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg shadow-emerald-500/20`
              : 'glass-card text-muted-foreground hover:text-white hover:border-emerald-500/30 border border-border'
          }`}
        >
          {(() => {
            const Icon = getIcon(category.icon);
            return <Icon className="w-4 h-4" />;
          })()}
          {category.name}
        </motion.button>
      ))}
    </div>
  );
}

// ============================================
// SHARED COMPONENT: Related Services
// ============================================
interface RelatedServicesProps {
  services: { title: string; description: string; path: string; icon: any; gradient: string }[];
  setCurrentPage: (path: string) => void;
}

function RelatedServices({ services, setCurrentPage }: RelatedServicesProps) {
  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <Badge className="mb-4 bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
          <Zap className="w-3 h-3 mr-1" />
          Explore More
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Related <span className="gradient-text">Services</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Discover more ways we can help transform your visual content
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {services.map((service, idx) => (
          <motion.div
            key={`related-${idx}-${service.path}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card 
              className="glass-card cursor-pointer hover:border-emerald-500/30 transition-all group"
              onClick={() => handleNavigate(service.path)}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================
// SHARED COMPONENT: Service CTA
// ============================================
interface ServiceCTAProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  setCurrentPage: (path: string) => void;
  gradient?: string;
}

function ServiceCTA({ title, description, buttonText, buttonHref, setCurrentPage, gradient = 'from-emerald-500 to-teal-600' }: ServiceCTAProps) {
  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <Card className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${gradient.replace('from-', 'from-').replace('to-', 'to-')}/10`} />
          <div className="relative">
            <Badge className="mb-4 bg-black/5 dark:bg-white/10 border-border text-foreground">
              <Gift className="w-3 h-3 mr-1" />
              Free Trial
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{description}</p>
            <Button size="lg" className={`bg-gradient-to-r ${gradient} shadow-lg shadow-emerald-500/25`} asChild>
              <a href={buttonHref} onClick={() => handleNavigate(buttonHref)}>
                {buttonText}
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

// ============================================
// CLIPPING PATH SERVICE PAGE
// Categories: Image Editing + Specialized
// ============================================
export function ClippingPathServicePage() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const [activeCategory, setActiveCategory] = useState(0);
  
  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
  };
  
  // Filter categories for this page
  const pageCategories = serviceCategories.filter(cat => 
    pageCategoryConfig['/services/clipping-path'].includes(cat.id)
  );
  
  const relatedServices = relatedServicesConfig['/services/clipping-path'] || [];
  
  return (
    <div className="py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge className="mb-4 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
            <Layers className="w-3 h-3 mr-1" />
            Clipping Path Services
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Precision <span className="gradient-text">Background Removal</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hand-drawn clipping paths for clean, professional cutouts.
            Perfect for e-commerce, advertising, and print media.
          </p>
        </motion.div>
      </section>

      {/* Category Tabs - Only Image Editing + Specialized */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our comprehensive clipping path and image editing solutions
          </p>
        </motion.div>

        <ServiceCategoryTabs 
          categories={pageCategories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          getIcon={getIcon}
        />

        {/* Services Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {pageCategories[activeCategory]?.services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`glass-card h-full hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group ${
                    service.popular ? 'border-emerald-500/30' : ''
                  }`}
                  onClick={() => handleNavigate('/pricing')}
                >
                  <CardContent className="p-5 relative">
                    {service.popular && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs border-0">
                          Popular
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pageCategories[activeCategory].gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {(() => {
                          const Icon = getIcon(service.icon);
                          return <Icon className="w-5 h-5 text-white" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{service.title}</h3>
                        <p className="text-emerald-400 text-xs">{service.price}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                    <div className="flex items-center text-emerald-400 text-xs mt-3 group-hover:text-teal-400 transition-colors">
                      View Pricing
                      <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-teal-500/10 border-teal-500/30 text-teal-400">
            <Zap className="w-3 h-3 mr-1" />
            Simple Process
          </Badge>
          <h2 className="text-3xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
        </motion.div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {['Upload Images', 'We Process', 'Review & Revise', 'Download'].map((step, idx) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                {idx + 1}
              </div>
              <h3 className="font-semibold mb-2">{step}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid md:grid-cols-4 gap-4">
          {guarantees.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-card text-center p-6 hover:border-emerald-500/30 transition-all">
                <item.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Related Services */}
      <RelatedServices services={relatedServices} setCurrentPage={setCurrentPage} />

      {/* CTA */}
      <ServiceCTA 
        title="Ready to Get Started?"
        description="Try our clipping path service with 3 free images"
        buttonText="Start Your Project"
        buttonHref="/brief/new"
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

// ============================================
// IMAGE SERVICE PAGE
// Categories: Specialized + Ecommerce
// ============================================
export function ImageServicePage() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const [activeCategory, setActiveCategory] = useState(0);
  
  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
  };
  
  // Filter categories for this page
  const pageCategories = serviceCategories.filter(cat => 
    pageCategoryConfig['/services/image'].includes(cat.id)
  );
  
  const relatedServices = relatedServicesConfig['/services/image'] || [];
  
  return (
    <div className="py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge className="mb-4 bg-teal-500/10 border-teal-500/30 text-teal-400">
            <ImageIcon className="w-3 h-3 mr-1" />
            Image Services
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Professional <span className="gradient-text">Image Editing</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From specialized retouching to e-commerce optimization, we deliver pixel-perfect results
            with industry-leading turnaround times.
          </p>
        </motion.div>
      </section>

      {/* Category Tabs - Only Specialized + Ecommerce */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our specialized and e-commerce image solutions
          </p>
        </motion.div>

        <ServiceCategoryTabs 
          categories={pageCategories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          getIcon={getIcon}
        />

        {/* Services Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {pageCategories[activeCategory]?.services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`glass-card h-full hover:border-teal-500/30 transition-all duration-300 cursor-pointer group ${
                    service.popular ? 'border-teal-500/30' : ''
                  }`}
                  onClick={() => handleNavigate('/pricing')}
                >
                  <CardContent className="p-5 relative">
                    {service.popular && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs border-0">
                          Popular
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pageCategories[activeCategory].gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {(() => {
                          const Icon = getIcon(service.icon);
                          return <Icon className="w-5 h-5 text-white" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{service.title}</h3>
                        <p className="text-teal-400 text-xs">{service.price}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                    <div className="flex items-center text-teal-400 text-xs mt-3 group-hover:text-cyan-400 transition-colors">
                      View Pricing
                      <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {serviceStats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services */}
      <RelatedServices services={relatedServices} setCurrentPage={setCurrentPage} />

      {/* CTA */}
      <ServiceCTA 
        title="Ready to Get Started?"
        description="Get a free quote for your project"
        buttonText="Start Your Project"
        buttonHref="/brief/new"
        setCurrentPage={setCurrentPage}
        gradient="from-teal-500 to-cyan-600"
      />
    </div>
  );
}

// ============================================
// VIDEO SERVICE PAGE
// Categories: Video Services only
// ============================================
export function VideoServicePage() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const [activeCategory, setActiveCategory] = useState(0);
  
  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
  };
  
  // Filter categories for this page
  const pageCategories = serviceCategories.filter(cat => 
    pageCategoryConfig['/services/video'].includes(cat.id)
  );
  
  const relatedServices = relatedServicesConfig['/services/video'] || [];
  
  return (
    <div className="py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge className="mb-4 bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
            <Video className="w-3 h-3 mr-1" />
            Video Services
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Cinematic <span className="gradient-text">Video Editing</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transform your raw footage into engaging content that captivates your audience.
          </p>
        </motion.div>
      </section>

      {/* Services Grid - Single Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">
            Our <span className="gradient-text">Video Services</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Professional video editing services for every need
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageCategories[0]?.services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className={`glass-card h-full hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group ${
                  service.popular ? 'border-cyan-500/30' : ''
                }`}
                onClick={() => handleNavigate('/pricing')}
              >
                <CardContent className="p-5 relative">
                  {service.popular && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs border-0">
                        Popular
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pageCategories[0].gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {(() => {
                        const Icon = getIcon(service.icon);
                        return <Icon className="w-5 h-5 text-white" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{service.title}</h3>
                      <p className="text-cyan-400 text-xs">{service.price}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                  <div className="flex items-center text-cyan-400 text-xs mt-3 group-hover:text-blue-400 transition-colors">
                    View Pricing
                    <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-blue-500/10 border-blue-500/30 text-blue-400">
            <Zap className="w-3 h-3 mr-1" />
            Simple Process
          </Badge>
          <h2 className="text-3xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
        </motion.div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {['Upload Footage', 'We Edit', 'Review & Revise', 'Download'].map((step, idx) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                {idx + 1}
              </div>
              <h3 className="font-semibold mb-2">{step}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Related Services */}
      <RelatedServices services={relatedServices} setCurrentPage={setCurrentPage} />

      {/* CTA */}
      <ServiceCTA 
        title="Let's Create Something Amazing"
        description="Discuss your video project with our team"
        buttonText="Start Your Project"
        buttonHref="/brief/new"
        setCurrentPage={setCurrentPage}
        gradient="from-cyan-500 to-blue-600"
      />
    </div>
  );
}

// ============================================
// AI SERVICE PAGE
// Categories: AI Services only
// ============================================
export function AIServicePage() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  
  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
  };
  
  // Filter categories for this page
  const pageCategories = serviceCategories.filter(cat => 
    pageCategoryConfig['/services/ai'].includes(cat.id)
  );
  
  const relatedServices = relatedServicesConfig['/services/ai'] || [];
  
  return (
    <div className="py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge className="mb-4 bg-blue-500/10 border-blue-500/30 text-blue-400">
            <Bot className="w-3 h-3 mr-1" />
            AI Operations
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Intelligent <span className="gradient-text">AI Automation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Leverage cutting-edge AI to automate workflows, process data at scale, and enhance your content.
          </p>
        </motion.div>
      </section>

      {/* Services Grid - Single Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">
            Our <span className="gradient-text">AI Services</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Cutting-edge AI solutions for automated processing
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageCategories[0]?.services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className={`glass-card h-full hover:border-blue-500/30 transition-all duration-300 cursor-pointer group ${
                  service.popular ? 'border-blue-500/30' : ''
                }`}
                onClick={() => handleNavigate('/pricing')}
              >
                <CardContent className="p-5 relative">
                  {service.popular && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs border-0">
                        Popular
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pageCategories[0].gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {(() => {
                        const Icon = getIcon(service.icon);
                        return <Icon className="w-5 h-5 text-white" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{service.title}</h3>
                      <p className="text-blue-400 text-xs">{service.price}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                  <div className="flex items-center text-blue-400 text-xs mt-3 group-hover:text-indigo-400 transition-colors">
                    View Pricing
                    <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
            <Zap className="w-3 h-3 mr-1" />
            AI Advantages
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Why Choose <span className="gradient-text">AI Processing</span></h2>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Lightning Fast', description: 'Process thousands of images in minutes, not hours' },
            { icon: DollarSign, title: '70% Cost Savings', description: 'Reduce your editing costs with automation' },
            { icon: RefreshCw, title: 'Consistent Quality', description: 'Uniform results across all your content' },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-card text-center p-6 hover:border-blue-500/30 transition-all">
                <item.icon className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Related Services */}
      <RelatedServices services={relatedServices} setCurrentPage={setCurrentPage} />

      {/* CTA */}
      <ServiceCTA 
        title="Explore AI Solutions"
        description="Let's discuss how AI can transform your workflow"
        buttonText="Request Consultation"
        buttonHref="/brief/new"
        setCurrentPage={setCurrentPage}
        gradient="from-blue-500 to-indigo-600"
      />
    </div>
  );
}

// ============================================
// WEB SERVICE PAGE
// Categories: Web Design only
// ============================================
export function WebServicePage() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const [activeTab, setActiveTab] = useState('services');
  
  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
  };
  
  // Filter categories for this page
  const pageCategories = serviceCategories.filter(cat => 
    pageCategoryConfig['/services/web'].includes(cat.id)
  );
  
  const relatedServices = relatedServicesConfig['/services/web'] || [];

  const webPortfolio = [
    {
      title: 'E-commerce Platform',
      category: 'Web App',
      description: 'Full-featured online store with custom checkout',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'SaaS Dashboard',
      category: 'Web App',
      description: 'Analytics dashboard for enterprise clients',
      gradient: 'from-teal-500 to-cyan-600',
    },
    {
      title: 'Portfolio Website',
      category: 'Website',
      description: 'Creative portfolio for photographer',
      gradient: 'from-cyan-500 to-blue-600',
    },
  ];
  
  return (
    <div className="py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge className="mb-4 bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
            <Globe className="w-3 h-3 mr-1" />
            Web Design Studio
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Digital <span className="gradient-text">Experiences</span> That Matter
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From stunning websites to complex web applications, we build digital products
            that help your business grow.
          </p>
        </motion.div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/5 mb-8">
            <TabsTrigger value="services" className="data-[state=active]:bg-indigo-500/20">
              Services
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-indigo-500/20">
              Portfolio
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="services">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                Our <span className="gradient-text">Web Services</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Complete web development solutions for your business
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pageCategories[0]?.services.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={`glass-card h-full hover:border-indigo-500/30 transition-all duration-300 cursor-pointer group ${
                      service.popular ? 'border-indigo-500/30' : ''
                    }`}
                    onClick={() => handleNavigate('/pricing')}
                  >
                    <CardContent className="p-5 relative">
                      {service.popular && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs border-0">
                            Popular
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pageCategories[0].gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {(() => {
                            const Icon = getIcon(service.icon);
                            return <Icon className="w-5 h-5 text-white" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{service.title}</h3>
                          <p className="text-indigo-400 text-xs">{service.price}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                      <div className="flex items-center text-indigo-400 text-xs mt-3 group-hover:text-purple-400 transition-colors">
                        View Pricing
                        <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="portfolio">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                Our <span className="gradient-text">Portfolio</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                See what we've built for our clients
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {webPortfolio.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    className="glass-card overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer group"
                    onClick={() => handleNavigate('/pricing')}
                  >
                    <div className={`h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                      <Globe className="w-16 h-16 text-white/50 group-hover:scale-110 transition-transform" />
                    </div>
                    <CardContent className="p-4">
                      <Badge className="mb-2 bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-xs">
                        {item.category}
                      </Badge>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center text-indigo-400 text-xs mt-2 group-hover:text-purple-400 transition-colors">
                        View Pricing
                        <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Related Services */}
      <RelatedServices services={relatedServices} setCurrentPage={setCurrentPage} />

      {/* CTA */}
      <ServiceCTA 
        title="Ready to Build Your Dream Project?"
        description="Let's discuss your web development needs"
        buttonText="Start Your Project"
        buttonHref="/brief/new"
        setCurrentPage={setCurrentPage}
        gradient="from-indigo-500 to-purple-600"
      />
    </div>
  );
}
