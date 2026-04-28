'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon, Video, Bot, ArrowRight, Clock, Star,
  Layers, Wand2, Palette, Camera, Film, Upload, Settings, Download, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCmsServices } from '@/hooks/cms/use-cms-content';

export const dynamic = 'force-dynamic';

const iconMap: Record<string, any> = {
  Image: ImageIcon, Video, Bot, Layers, Palette, Film, Camera
};

const getIcon = (iconName: string) => iconMap[iconName] || Layers;

const defaultServicesData = [
  {
    id: 'clipping-paths',
    title: 'Precision Clipping Path',
    subtitle: 'Pixel-Perfect Background Removal',
    description: 'Hand-crafted clipping paths by expert editors who understand e-commerce. Every curve, every edge is traced with surgical precision for backgrounds that vanish seamlessly.',
    features: [
      '100% Hand-drawn paths (no auto-selection)',
      'Up to 4000+ anchor points for complex items',
      'Transparent, white, or custom backgrounds',
      'Layered PSD/PSB delivery with editable paths',
    ],
    pricing: { starting: '$0.20', unit: '/image' },
    gradient: 'from-emerald-500 to-green-600',
    icon: 'Layers',
  },
  {
    id: 'image-editing',
    title: 'Professional Image Editing',
    subtitle: 'Make Every Photo Sell',
    description: 'From basic retouching to high-end beauty edits, our team transforms ordinary photos into conversion-driving assets.',
    features: [
      'High-end skin & beauty retouching',
      'Natural shadow & reflection creation',
      'Ghost mannequin for fashion brands',
      'Color matching across product lines',
    ],
    pricing: { starting: '$0.15', unit: '/image' },
    gradient: 'from-blue-500 to-purple-600',
    icon: 'Palette',
  },
  {
    id: 'video-editing',
    title: 'Professional Video Editing',
    subtitle: 'Cinematic Content Creation',
    description: 'Transform raw footage into compelling stories. Our video editors specialize in product demos, testimonials, and social media content.',
    features: [
      'Professional video editing & color grading',
      'Motion graphics and text animations',
      'Audio enhancement and sound design',
    ],
    pricing: { starting: '$25', unit: '/minute' },
    gradient: 'from-cyan-500 to-blue-600',
    icon: 'Film',
  },
  {
    id: 'ai-processing',
    title: 'AI-Powered Image Processing',
    subtitle: 'Smart Automation at Scale',
    description: 'Leverage cutting-edge AI to process thousands of images automatically. Perfect for e-commerce platforms with high-volume needs.',
    features: [
      'AI-powered background removal',
      'Automated quality checks',
      'Batch processing capabilities',
    ],
    pricing: { starting: '$0.05', unit: '/image' },
    gradient: 'from-purple-500 to-pink-600',
    icon: 'Bot',
  },
];

const serviceStats = [
  { value: '50M+', label: 'Images Processed' },
  { value: '100K+', label: 'Videos Created' },
  { value: '99.8%', label: 'Satisfaction Rate' },
  { value: '18h', label: 'Avg Turnaround' },
];

const processSteps = [
  { step: 1, title: 'Upload', description: 'Drag & drop your files', icon: Upload },
  { step: 2, title: 'Specify', description: 'Tell us your requirements', icon: Settings },
  { step: 3, title: 'We Edit', description: 'Expert editors process', icon: Wand2 },
  { step: 4, title: 'Review', description: 'Preview and request revisions', icon: Eye },
  { step: 5, title: 'Download', description: 'Get your perfect files', icon: Download },
];

function ServiceCard({ service }: { service: any }) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
      style={{ border: '1px solid rgba(99, 102, 241, 0.2)' }}>
      <div className="relative h-48 overflow-hidden" style={{ background: `linear-gradient(${service.gradient})` }}>
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
          <div className="text-white/20 text-6xl filter drop-shadow-2xl">
            {getIcon(service.icon)}
          </div>
        </div>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold leading-tight">{service.title}</CardTitle>
        <Badge variant="secondary" className="mt-2 text-xs font-medium px-2 py-1"
          style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          {service.subtitle}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {service.features?.map((feature: string, idx: number) => (
            <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5 border-indigo-200/50 text-indigo-700"
              style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
              {feature}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#6366f1' }}>{service.pricing.starting}</span>
            <span className="text-xs font-medium text-muted-foreground">{service.pricing.unit}</span>
          </div>
          <Button size="sm" variant="ghost" className="h-8 px-3 text-indigo-600 hover:bg-indigo-500/10">
            View Details <ArrowRight className="ml-1.5 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServicesPage() {
  const { data: cmsServices, loading: servicesLoading } = useCmsServices();
  
  const services = cmsServices && cmsServices.length > 0 ? cmsServices : defaultServicesData;

  if (servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-border/20 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)', borderRadius: '16px', padding: '4rem 2rem' }}>
          <div className="mb-8">
            <Badge variant="secondary" className="text-xs font-medium px-3 py-1.5 uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              Trusted by 500+ Clients Worldwide
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6" style={{ color: '#1f2937' }}>
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Image & Video Editing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" style={{ color: '#6b7280' }}>
            Complete enterprise solutions for image editing, video production, and digital asset management. Processing 50M+ images with 99.8% satisfaction rate.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12" style={{ color: '#1f2937' }}>Our Service Portfolio</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Process Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12" style={{ color: '#1f2937' }}>Our Workflow</h2>
          <div className="grid md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {processSteps.map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4" style={{ border: '2px solid rgba(99, 102, 241, 0.3)' }}>
                  <step.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#1f2937' }}>{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {serviceStats.map((stat, idx) => (
            <div key={idx} className="text-center py-8" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(139,92,246,0.03) 100%)', borderRadius: '12px' }}>
              <div className="text-4xl font-bold tracking-tight" style={{ color: '#6366f1' }}>{stat.value}</div>
              <div className="mt-2 text-sm font-medium" style={{ color: '#6b7280' }}>{stat.label}</div>
              <div className="w-12 h-1 bg-indigo-500 rounded-full mx-auto mt-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}