'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Globe, Code, Smartphone, Palette, ArrowRight, Sparkles,
  Layers, Zap, Shield, Users, CheckCircle, ExternalLink,
  Monitor, Tablet, Phone, ChevronLeft, ChevronRight,
  Clock, Award, Gift, Star, Eye, Rocket, Layout, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StarRating } from '@/components/ui/star-rating';
import { GlassCard, GlassCardService } from '@/components/ui/glass-card';
import { useAppStore } from '@/store/app-store';

// Live Demo Templates
const liveDemos = [
  {
    id: 1,
    title: 'SaaS Startup Template',
    description: 'Modern SaaS landing page with pricing, features, and testimonials sections.',
    url: 'https://startup.demo.nextjstemplates.com/',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    tags: ['SaaS', 'Startup', 'Landing Page'],
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 2,
    title: 'SaaS UI Pro Template',
    description: 'Professional SaaS dashboard with dark mode and modern components.',
    url: 'https://saas-ui-nextjs-landing-page.netlify.app/',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    tags: ['Dashboard', 'UI Kit', 'Dark Mode'],
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 3,
    title: 'SaaS Starter Template',
    description: 'Clean and minimal SaaS template with smooth animations.',
    url: 'https://next-saas-start.vercel.app/',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&h=400&fit=crop',
    tags: ['Minimal', 'Animated', 'Modern'],
    gradient: 'from-emerald-500 to-teal-600',
  },
];

const studioServices = [
  {
    icon: Globe,
    title: 'Website Design',
    description: 'Custom-designed websites that reflect your brand identity.',
    features: ['Responsive design', 'SEO optimized', 'Fast loading'],
    startingPrice: '$2,500',
  },
  {
    icon: Code,
    title: 'Web Development',
    description: 'Full-stack web applications with modern technologies.',
    features: ['React/Next.js', 'Node.js backend', 'API integration'],
    startingPrice: '$5,000',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Progressive web apps that work on any device.',
    features: ['PWA ready', 'Offline support', 'App-like UX'],
    startingPrice: '$4,000',
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description: 'User-centered design that converts visitors.',
    features: ['User research', 'Wireframing', 'Design systems'],
    startingPrice: '$1,500',
  },
];

const portfolioProjects = [
  {
    id: 1,
    title: 'E-commerce Platform',
    client: 'Fashion Brand',
    category: 'Web App',
    description: 'Full-featured online store with custom checkout.',
    tech: ['Next.js', 'Stripe', 'PostgreSQL'],
    gradient: 'from-emerald-500 to-teal-600',
    stats: { conversion: '+45%', speed: '2.1s', users: '50K+' },
    featured: true,
  },
  {
    id: 2,
    title: 'SaaS Dashboard',
    client: 'Tech Startup',
    category: 'Web App',
    description: 'Real-time analytics dashboard with data visualization.',
    tech: ['React', 'D3.js', 'WebSocket'],
    gradient: 'from-teal-500 to-cyan-600',
    stats: { conversion: '+32%', speed: '1.8s', users: '10K+' },
    featured: true,
  },
  {
    id: 3,
    title: 'Portfolio Website',
    client: 'Creative Agency',
    category: 'Website',
    description: 'Award-winning portfolio with smooth animations.',
    tech: ['Next.js', 'Framer Motion', 'GSAP'],
    gradient: 'from-cyan-500 to-blue-600',
    stats: { conversion: '+28%', speed: '1.5s', users: '5K+' },
    featured: true,
  },
  {
    id: 4,
    title: 'Booking Platform',
    client: 'Healthcare',
    category: 'Web App',
    description: 'Appointment scheduling with video consultations.',
    tech: ['Next.js', 'WebRTC', 'PostgreSQL'],
    gradient: 'from-blue-500 to-indigo-600',
    stats: { conversion: '+52%', speed: '2.0s', users: '20K+' },
    featured: false,
  },
  {
    id: 5,
    title: 'Learning Platform',
    client: 'Education Tech',
    category: 'Web App',
    description: 'Interactive e-learning with progress tracking.',
    tech: ['React', 'Node.js', 'MongoDB'],
    gradient: 'from-indigo-500 to-purple-600',
    stats: { conversion: '+38%', speed: '2.2s', users: '100K+' },
    featured: false,
  },
  {
    id: 6,
    title: 'Corporate Website',
    client: 'Finance Corp',
    category: 'Website',
    description: 'Professional corporate website with investor relations.',
    tech: ['Next.js', 'Contentful', 'Tailwind'],
    gradient: 'from-purple-500 to-pink-600',
    stats: { conversion: '+22%', speed: '1.3s', users: '3K+' },
    featured: false,
  },
];

const techStack = [
  { name: 'Next.js', category: 'Framework', level: 95 },
  { name: 'React', category: 'Library', level: 98 },
  { name: 'TypeScript', category: 'Language', level: 92 },
  { name: 'Node.js', category: 'Backend', level: 90 },
  { name: 'PostgreSQL', category: 'Database', level: 88 },
  { name: 'Tailwind CSS', category: 'Styling', level: 95 },
  { name: 'Framer Motion', category: 'Animation', level: 85 },
  { name: 'Prisma', category: 'ORM', level: 90 },
];

const processSteps = [
  { step: 1, title: 'Discovery', description: 'Learn about your business and goals', duration: '1-2 weeks' },
  { step: 2, title: 'Design', description: 'Wireframes and visual designs', duration: '2-4 weeks' },
  { step: 3, title: 'Development', description: 'Clean, maintainable code', duration: '4-8 weeks' },
  { step: 4, title: 'Launch', description: 'Deploy and provide support', duration: '1 week' },
];

const testimonials = [
  {
    name: 'David Park',
    role: 'CEO',
    company: 'TechVenture Inc.',
    content: 'ClippingBD Studio delivered our platform ahead of schedule with exceptional quality.',
    rating: 5,
    avatar: 'DP',
  },
  {
    name: 'Lisa Chen',
    role: 'Marketing Director',
    company: 'BrandFlow',
    content: 'Our new website has increased conversions by 45%. The team truly understood our vision.',
    rating: 4.7,
    avatar: 'LC',
  },
  {
    name: 'James Wilson',
    role: 'Founder',
    company: 'StartupLab',
    content: 'Working with ClippingBD was a game-changer. They delivered a complex web app that scaled perfectly.',
    rating: 4.3,
    avatar: 'JW',
  },
  {
    name: 'Maria Garcia',
    role: 'Product Manager',
    company: 'EcomFlow',
    content: 'Great communication and technical skills. The ongoing maintenance support is excellent.',
    rating: 4.8,
    avatar: 'MG',
  },
];

export function StudioPage() {
  const [activeProject, setActiveProject] = useState(0);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

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

  const featuredProjects = portfolioProjects.filter(p => p.featured);

  // Auto-rotate featured projects
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProject((prev) => (prev + 1) % featuredProjects.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredProjects.length]);

  const renderDeviceIcon = () => {
    switch (deviceView) {
      case 'tablet': return <Tablet className="w-12 h-12 mx-auto mb-3 opacity-50" />;
      case 'mobile': return <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />;
      default: return <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />;
    }
  };

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className="badge-premium mb-4 bg-blue-500/10 border-blue-500/30 text-blue-400 px-4 py-1.5 glow-emerald">
                <Globe className="w-4 h-4 mr-2" />
                Web Design Studio
              </Badge>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              We Build <span className="gradient-text">Digital Experiences</span> That Matter
            </h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              From stunning websites to complex web applications, our studio delivers 
              pixel-perfect designs and robust code that help your business grow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25" 
                asChild
              >
                <a href="/brief/new" onClick={() => handleNavigate('/brief/new')}>
                  Start Your Project
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-border" asChild>
                <a href="#portfolio">View Portfolio</a>
              </Button>
            </div>
          </motion.div>

          {/* Featured Project Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Device Toggle */}
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-2">preview.clippingbd.com</span>
                </div>
                <div className="flex gap-1">
                  {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                    <Button
                      key={device}
                      variant="ghost"
                      size="sm"
                      className={`h-7 w-7 p-0 ${deviceView === device ? 'text-blue-400 bg-blue-500/10' : 'text-muted-foreground'}`}
                      onClick={() => setDeviceView(device)}
                    >
                      {device === 'desktop' && <Monitor className="w-3.5 h-3.5" />}
                      {device === 'tablet' && <Tablet className="w-3.5 h-3.5" />}
                      {device === 'mobile' && <Phone className="w-3.5 h-3.5" />}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Preview Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className={`relative ${
                    deviceView === 'mobile' ? 'aspect-[9/16] max-w-xs mx-auto' : 
                    deviceView === 'tablet' ? 'aspect-[4/3]' : 
                    'aspect-video'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${featuredProjects[activeProject]?.gradient} flex items-center justify-center`}>
                    <div className="text-center text-white p-6">
                      {renderDeviceIcon()}
                      <h3 className="text-xl font-bold mb-1">{featuredProjects[activeProject]?.title}</h3>
                      <p className="text-white/70 text-sm">{featuredProjects[activeProject]?.client}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Project Navigation */}
              <div className="flex items-center justify-between p-3 border-t border-border">
                <div className="flex gap-1.5">
                  {featuredProjects.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveProject(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeProject === idx ? 'bg-blue-500 w-5' : 'bg-white/30 w-1.5 hover:bg-black/5 dark:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white h-7 text-xs">
                  View Details
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Demo Templates */}
      <section className="py-16 border-y border-border bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Badge className="mb-3 bg-blue-500/10 border-blue-500/30 text-blue-400">
              <Rocket className="w-3 h-3 mr-1" />
              Live Demos
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              See Our Work in <span className="gradient-text">Action</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Click any template below to see a live demo of what we can build for you.
              Each template is fully responsive and customizable.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {liveDemos.map((demo, idx) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card overflow-hidden group hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${demo.gradient} opacity-80`} />
                    <img 
                      src={demo.image} 
                      alt={demo.title}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {demo.tags.map((tag) => (
                        <Badge key={tag} className="bg-white/20 backdrop-blur-sm text-white border-0 text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">{demo.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{demo.description}</p>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 group/btn"
                      asChild
                    >
                      <a href={demo.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        View Live Demo
                        <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <p className="text-muted-foreground text-sm mb-4">
              Want a custom design? We can create a unique website tailored to your brand.
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              asChild
            >
              <a href="/brief/new" onClick={() => handleNavigate('/brief/new')}>
                <Wand2 className="w-4 h-4 mr-2" />
                Request Custom Design
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Badge className="mb-3 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <Layers className="w-3 h-3 mr-1" />
              Studio Services
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Comprehensive <span className="gradient-text">Web Solutions</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {studioServices.map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCardService
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  gradient="from-blue-500 to-indigo-600"
                  className="h-full"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section id="portfolio" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Badge className="mb-3 bg-teal-500/10 border-teal-500/30 text-teal-400">
              <Globe className="w-3 h-3 mr-1" />
              Portfolio
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Featured <span className="gradient-text">Projects</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card overflow-hidden group hover:border-blue-500/30 transition-all duration-300 cursor-pointer">
                  <div className={`aspect-video bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Monitor className="w-12 h-12 text-white/30 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    {project.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">Featured</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] border-border">{project.category}</Badge>
                      <span className="text-[10px] text-muted-foreground">{project.client}</span>
                    </div>
                    <h3 className="font-medium text-sm mb-1 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tech.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] border-border text-muted-foreground">{t}</Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div>
                        <div className="text-emerald-400 font-medium">{project.stats.conversion}</div>
                        <div className="text-muted-foreground">Conversion</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-medium">{project.stats.speed}</div>
                        <div className="text-muted-foreground">Load Time</div>
                      </div>
                      <div>
                        <div className="text-purple-400 font-medium">{project.stats.users}</div>
                        <div className="text-muted-foreground">Users</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <Badge className="mb-3 bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
              <Code className="w-3 h-3 mr-1" />
              Tech Stack
            </Badge>
            <h2 className="text-2xl font-bold mb-2">
              Modern <span className="gradient-text">Technologies</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {techStack.map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card p-3 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{tech.name}</span>
                    <span className="text-[10px] text-muted-foreground">{tech.category}</span>
                  </div>
                  <Progress value={tech.level} className="h-1" />
                  <div className="text-[10px] text-muted-foreground mt-1">{tech.level}%</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Badge className="mb-3 bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
              <Zap className="w-3 h-3 mr-1" />
              Our Process
            </Badge>
            <h2 className="text-2xl font-bold mb-2">
              How We <span className="gradient-text">Work</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4">
            {processSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card h-full relative overflow-hidden group hover:border-blue-500/30 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-full" />
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 text-white font-bold shadow-lg">
                      {step.step}
                    </div>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-xs mb-2">{step.description}</p>
                    <Badge variant="outline" className="text-[10px] border-border">
                      <Clock className="w-2.5 h-2.5 mr-1" />
                      {step.duration}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Badge className="mb-3 bg-amber-500/10 border-amber-500/30 text-amber-400">
              <Star className="w-3 h-3 mr-1" />
              Client Testimonials
            </Badge>
            <h2 className="text-2xl font-bold mb-2">
              What Our <span className="gradient-text">Clients Say</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card h-full hover:border-blue-500/30 transition-all">
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <StarRating rating={testimonial.rating} size="sm" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">"{testimonial.content}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{testimonial.name}</p>
                        <p className="text-[10px] text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10" />
              <div className="relative">
                <Badge className="mb-3 bg-black/5 dark:bg-white/10 border-border text-foreground dark:text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Let's Build Together
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Start Your Project?</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-sm">
                  Let's discuss your vision and create something amazing together.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25" 
                    asChild
                  >
                    <a href="/brief/new" onClick={() => handleNavigate('/brief/new')}>
                      Start Your Project
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="border-border" asChild>
                    <a href="/contact" onClick={() => handleNavigate('/contact')}>
                      Schedule a Call
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
