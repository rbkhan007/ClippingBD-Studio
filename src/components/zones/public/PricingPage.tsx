'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Calculator, ArrowRight, CheckCircle, Zap, Clock, Star,
  HelpCircle, ChevronRight, Image as ImageIcon, Video, Bot,
  Layers, Wand2, Sparkles, Shield, TrendingDown, Percent,
  RefreshCw, Award, Users, Globe, DollarSign, Gift,
  X, Check, Info, Code, Monitor, Store, ShoppingCart,
  Megaphone, Building, MapPin, Phone, Mail, MessageCircle,
  Cpu, Palette, Shirt, PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { GlassCard, GlassCardPricing } from '@/components/ui/glass-card';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { useAppStore } from '@/store/app-store';

// ============================================
// 2026 TRANSPARENT PRICING DATA
// ============================================

// Image & Clipping Services Pricing
const imagePricing = [
  { service: 'Clipping Path', price: '$0.20', unit: '/ image', bestFor: 'E-commerce product listings', icon: Layers, popular: true },
  { service: 'Background Removal', price: '$0.15', unit: '/ image', bestFor: 'Simple cutouts & portraits', icon: Wand2 },
  { service: 'Image Masking', price: '$0.50', unit: '/ image', bestFor: 'Complex edges (hair, fur, glass)', icon: PenTool },
  { service: 'Ghost Mannequin', price: '$1.00', unit: '/ image', bestFor: 'Apparel & Fashion brands', icon: Shirt },
  { service: 'Color Correction', price: '$0.20', unit: '/ image', bestFor: 'Real estate & Studio shots', icon: Palette },
  { service: 'Photo Retouching', price: '$0.35', unit: '/ image', bestFor: 'Portrait & product enhancement', icon: Sparkles },
];

// Web Development Studio Pricing
const webPricing = [
  { package: 'Landing Pages', price: '$500 - $1,200', includes: 'High-conversion single pages', icon: Monitor, features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Contact Forms'] },
  { package: 'Custom Website', price: '$2,500+', includes: 'Next.js/React, UI/UX, SEO ready', icon: Code, popular: true, features: ['Custom Design', 'CMS Integration', 'Performance Optimized', 'Analytics Setup'] },
  { package: 'E-commerce Platform', price: '$3,500+', includes: 'Stripe/Payment, Inventory, Dashboard', icon: ShoppingCart, features: ['Product Catalog', 'Payment Gateway', 'Order Management', 'Customer Dashboard'] },
  { package: 'Monthly Support', price: '$200', unit: '/ month', includes: 'Maintenance, Security, Updates', icon: Shield, features: ['24/7 Monitoring', 'Security Patches', 'Content Updates', 'Performance Reports'] },
];

// Volume-based tiered pricing for calculator
const pricingTiers = {
  image: [
    { min: 1, max: 50, price: 0.35, discount: 0, label: '1-50 images' },
    { min: 51, max: 200, price: 0.30, discount: 14, label: '51-200 images' },
    { min: 201, max: 500, price: 0.25, discount: 29, label: '201-500 images' },
    { min: 501, max: 1000, price: 0.20, discount: 43, label: '501-1000 images' },
    { min: 1001, max: null, price: 0.15, discount: 57, label: '1000+ images' },
  ],
  video: [
    { min: 1, max: 5, price: 45, discount: 0, label: '1-5 videos' },
    { min: 6, max: 20, price: 35, discount: 22, label: '6-20 videos' },
    { min: 21, max: 50, price: 28, discount: 38, label: '21-50 videos' },
    { min: 51, max: null, price: 22, discount: 51, label: '50+ videos' },
  ],
  clipping: [
    { min: 1, max: 100, price: 0.25, discount: 0, label: '1-100 images' },
    { min: 101, max: 500, price: 0.20, discount: 20, label: '101-500 images' },
    { min: 501, max: 1000, price: 0.15, discount: 40, label: '501-1000 images' },
    { min: 1001, max: null, price: 0.10, discount: 60, label: '1000+ images' },
  ],
};

const serviceAddons = [
  { name: 'Rush Delivery (12h)', price: '+25%', description: 'Priority processing', icon: Zap },
  { name: 'Complex Background', price: '+$0.10', description: 'Multi-layer backgrounds', icon: Layers },
  { name: 'Shadow Creation', price: '+$0.05', description: 'Natural or drop shadow', icon: Sparkles },
  { name: 'Multiple Paths', price: '+$0.15', description: 'Color correction paths', icon: Wand2 },
];

const deliveryOptions = [
  { id: 'standard', name: 'Standard', time: '24-48h', surcharge: 0, icon: Clock, color: 'text-muted-foreground' },
  { id: 'express', name: 'Express', time: '12-24h', surcharge: 15, icon: TrendingDown, color: 'text-teal-400', popular: true },
  { id: 'nitro', name: 'Nitro', time: '12h', surcharge: 25, icon: Zap, color: 'text-red-400' },
];

const faqs = [
  { question: 'What is the minimum order requirement?', answer: 'There is no minimum order. You can start with just 1 image or video.' },
  { question: 'How long does standard delivery take?', answer: 'Standard turnaround is 24-48 hours depending on project complexity.' },
  { question: 'Do you offer free trials?', answer: 'Yes! New clients can try our services with up to 3 free images.' },
  { question: 'What file formats do you accept?', answer: 'We accept all major formats including JPEG, PNG, TIFF, PSD, RAW, and more.' },
  { question: 'How do revisions work?', answer: 'We offer unlimited revisions until you\'re satisfied.' },
  { question: 'Is my data secure?', answer: 'All files are encrypted in transit and at rest. We sign NDAs upon request.' },
  { question: 'Can I get a custom quote?', answer: 'Yes! For enterprise projects, contact our sales team for custom pricing.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers.' },
];

const enterpriseFeatures = [
  { icon: Users, text: 'Dedicated account manager' },
  { icon: Shield, text: 'Enhanced security & compliance' },
  { icon: Globe, text: 'Global team coverage (24/7)' },
  { icon: RefreshCw, text: 'Custom API integration' },
  { icon: Award, text: 'SLA guarantees' },
  { icon: Percent, text: 'Volume discounts up to 60%' },
];

const guarantees = [
  { icon: CheckCircle, title: 'Quality Guarantee', description: 'Unlimited revisions' },
  { icon: Shield, title: 'Secure Transfer', description: 'Encrypted files' },
  { icon: Clock, title: 'On-Time Delivery', description: 'Deadline guaranteed' },
  { icon: Award, title: 'Expert Editors', description: 'Skilled professionals' },
];

const trustBadges = [
  { icon: Shield, title: 'SOC 2 Compliant', description: 'Enterprise security' },
  { icon: Award, title: 'ISO 27001', description: 'Data protection' },
  { icon: Globe, title: 'GDPR Ready', description: 'Privacy compliant' },
  { icon: CheckCircle, title: '99.9% Uptime', description: 'Reliable service' },
];

export function PricingPage() {
  const [quantity, setQuantity] = useState(100);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'clipping'>('clipping');
  const [deliverySpeed, setDeliverySpeed] = useState('standard');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
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

  const calculatePrice = () => {
    const tiers = pricingTiers[activeTab];
    for (const tier of tiers) {
      if (tier.max === null || quantity <= tier.max) return tier.price;
    }
    return tiers[tiers.length - 1].price;
  };

  const getCurrentTier = () => {
    const tiers = pricingTiers[activeTab];
    for (const tier of tiers) {
      if (tier.max === null || quantity <= tier.max) return tier;
    }
    return tiers[tiers.length - 1];
  };

  const unitPrice = calculatePrice();
  const currentTier = getCurrentTier();
  const deliverySurcharge = deliveryOptions.find(d => d.id === deliverySpeed)?.surcharge || 0;
  
  const addonsCost = selectedAddons.reduce((acc, addonName) => {
    const addon = serviceAddons.find(a => a.name === addonName);
    if (!addon) return acc;
    if (addon.price.includes('%')) {
      return acc + (unitPrice * quantity * parseFloat(addon.price.replace('+', '').replace('%', '')) / 100);
    }
    return acc + parseFloat(addon.price.replace('+$', '')) * quantity;
  }, 0);

  const baseTotal = unitPrice * quantity;
  const deliveryCost = baseTotal * (deliverySurcharge / 100);
  const total = baseTotal + deliveryCost + addonsCost;
  const savings = currentTier.discount > 0 ? (pricingTiers[activeTab][0].price * quantity) - baseTotal : 0;

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) ? prev.filter(a => a !== addonName) : [...prev, addonName]
    );
  };

  const maxQuantity = activeTab === 'video' ? 100 : 2000;

  return (
    <div className="py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
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
              <Calculator className="w-4 h-4 mr-2" />
              Transparent Pricing 2026
            </Badge>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Simple, <span className="gradient-text">Competitive</span> Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional services at transparent rates. No hidden fees, no surprises.
            Volume discounts available for bulk orders.
          </p>
        </motion.div>
      </section>

      {/* Announcement Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-teal-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Badge className="mb-2 bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                    Announcement
                  </Badge>
                  <h3 className="text-lg font-bold mb-2">Operations & Pricing Update 2026</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    To better serve our global clientele, <strong>ClippingBD Studio</strong> has expanded its infrastructure. 
                    We have inaugurated our <strong>Main Headquarters and Production Hub</strong> in Chirirbandar, Dinajpur, 
                    and established a <strong>Regional Liaison Office</strong> in Dhaka.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    To reflect our investment in AI-driven automation and Full-stack Web Development, we have updated our service rates. 
                    These changes allow us to maintain our <strong>99.9% satisfaction guarantee</strong> while providing even faster 
                    <strong> Nitro Express turnaround times</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 border-y border-border mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {guarantees.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <item.icon className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image & Clipping Services Pricing Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <ImageIcon className="w-3 h-3 mr-1" />
              Image Services
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Image & <span className="gradient-text">Clipping Services</span>
            </h2>
            <p className="text-muted-foreground text-sm">Starting prices for professional image editing services</p>
          </div>

          <Card className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Service</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">Starting Price</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Best For</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imagePricing.map((item, idx) => (
                  <TableRow key={idx} className="border-border hover:bg-emerald-500/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.service}</span>
                          {item.popular && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Popular</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-bold text-emerald-400">{item.price}</span>
                      <span className="text-muted-foreground text-sm">{item.unit}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.bestFor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </section>

      {/* Web Development Studio Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
              <Code className="w-3 h-3 mr-1" />
              Web Development Studio
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Web Development <span className="gradient-text">Packages</span>
            </h2>
            <p className="text-muted-foreground text-sm">Full-stack web solutions with modern technologies</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {webPricing.map((pkg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`glass-card h-full ${pkg.popular ? 'border-emerald-500/30 glow-emerald' : 'hover:border-emerald-500/30'} transition-all`}>
                  <CardContent className="p-6">
                    {pkg.popular && (
                      <Badge className="mb-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs">
                        Most Popular
                      </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <pkg.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h3 className="font-bold">{pkg.package}</h3>
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-emerald-400">{pkg.price}</span>
                      {pkg.unit && <span className="text-muted-foreground text-sm">{pkg.unit}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{pkg.includes}</p>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Interactive Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-purple-500/10 border-purple-500/30 text-purple-400">
              <Calculator className="w-3 h-3 mr-1" />
              Price Calculator
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Calculate Your <span className="gradient-text">Savings</span>
            </h2>
            <p className="text-muted-foreground text-sm">See volume discounts in real-time</p>
          </div>

          <GlassCard variant="premium" className="max-w-4xl mx-auto overflow-hidden">
            <CardHeader className="border-b border-border p-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'video' | 'clipping')}>
                <TabsList className="grid w-full grid-cols-3 bg-white/5 h-12 rounded-none">
                  <TabsTrigger 
                    value="clipping" 
                    className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 h-12 rounded-none"
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Clipping Path
                  </TabsTrigger>
                  <TabsTrigger 
                    value="image" 
                    className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 h-12 rounded-none"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Image Editing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="video" 
                    className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 h-12 rounded-none"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Controls */}
                <div className="space-y-6">
                  {/* Quantity Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Quantity</Label>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => setQuantity(Math.max(1, quantity - 10))}
                        >
                          -
                        </Button>
                        <span className="text-xl font-bold w-16 text-center">{quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => setQuantity(Math.min(maxQuantity, quantity + 10))}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[quantity]}
                      onValueChange={([v]) => setQuantity(v)}
                      min={1}
                      max={maxQuantity}
                      step={activeTab === 'video' ? 1 : 10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1</span>
                      <span>{maxQuantity}+</span>
                    </div>
                  </div>

                  {/* Delivery Speed */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Delivery Speed</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {deliveryOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setDeliverySpeed(option.id)}
                          className={`relative p-3 rounded-xl border transition-all text-left ${
                            deliverySpeed === option.id 
                              ? 'border-emerald-500/50 bg-emerald-500/10' 
                              : 'border-white/10 hover:border-white/20 bg-white/5'
                          }`}
                        >
                          {option.popular && (
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                              <Badge className="bg-teal-500 text-[10px] border-0 py-0">Popular</Badge>
                            </div>
                          )}
                          <option.icon className={`w-4 h-4 mb-1 ${option.color}`} />
                          <div className="font-medium text-xs">{option.name}</div>
                          <div className="text-sm font-bold">{option.time}</div>
                          {option.surcharge > 0 && (
                            <div className="text-[10px] text-muted-foreground">+{option.surcharge}%</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Optional Add-ons</Label>
                    <div className="space-y-2">
                      {serviceAddons.map((addon) => (
                        <div
                          key={addon.name}
                          onClick={() => toggleAddon(addon.name)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                            selectedAddons.includes(addon.name)
                              ? 'border-emerald-500/50 bg-emerald-500/10'
                              : 'border-border hover:border-emerald-500/30 bg-black/5 dark:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <addon.icon className="w-3.5 h-3.5 text-muted-foreground" />
                            <div>
                              <div className="text-xs font-medium">{addon.name}</div>
                              <div className="text-[10px] text-muted-foreground">{addon.description}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                            {addon.price}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Pricing Tiers & Total */}
                <div className="space-y-4">
                  {/* Pricing Tiers */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Volume Discounts</Label>
                    {pricingTiers[activeTab].map((tier, idx) => (
                      <motion.div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg transition-all text-sm ${
                          quantity >= tier.min && (tier.max === null || quantity <= tier.max)
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-black/5 dark:bg-white/5 border border-transparent'
                        }`}
                        animate={{
                          scale: quantity >= tier.min && (tier.max === null || quantity <= tier.max) ? 1.02 : 1
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{tier.label}</span>
                          {tier.discount > 0 && (
                            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 py-0">
                              -{tier.discount}%
                            </Badge>
                          )}
                        </div>
                        <span className="font-medium text-xs">
                          ${tier.price.toFixed(2)} / {activeTab === 'video' ? 'video' : 'image'}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total */}
                  <Card className="glass-card border-emerald-500/30">
                    <CardContent className="p-4">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Base Price</span>
                          <span>${baseTotal.toFixed(2)}</span>
                        </div>
                        {deliverySurcharge > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Delivery Surcharge (+{deliverySurcharge}%)</span>
                            <span>${deliveryCost.toFixed(2)}</span>
                          </div>
                        )}
                        {addonsCost > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Add-ons</span>
                            <span>${addonsCost.toFixed(2)}</span>
                          </div>
                        )}
                        {savings > 0 && (
                          <div className="flex justify-between text-xs text-emerald-400">
                            <span>Volume Savings</span>
                            <span>-${savings.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-border pt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Estimated Total</span>
                            <span>${unitPrice.toFixed(2)} × {quantity}</span>
                          </div>
                          <div className="text-3xl font-bold gradient-text">
                            ${total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25" 
                        asChild
                      >
                        <a href="/brief/new" onClick={() => handleNavigate('/brief/new')}>
                          Start Your Project
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </a>
                      </Button>
                      
                      <p className="text-[10px] text-muted-foreground text-center mt-2">
                        Free trial available for new clients
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>
      </section>

      {/* Enterprise Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GlassCard variant="pricing" className="border-blue-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
            <CardContent className="p-6 relative">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <Badge className="mb-3 bg-blue-500/10 border-blue-500/30 text-blue-400">
                    <Users className="w-3 h-3 mr-1" />
                    Enterprise Solutions
                  </Badge>
                  <h2 className="text-2xl font-bold mb-3">Need High-Volume Processing?</h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Our enterprise plans offer dedicated support, custom integrations, 
                    and volume discounts up to 60%.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {enterpriseFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <feature.icon className="w-3.5 h-3.5 text-blue-400" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <div className="inline-block glass-card rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">Starting from</div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">$5,000/mo</div>
                    <Button className="bg-blue-500 hover:bg-blue-600" asChild>
                      <a href="/contact" onClick={() => handleNavigate('/contact')}>
                        Contact Sales
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 border-y border-border mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <Badge className="mb-3 bg-purple-500/10 border-purple-500/30 text-purple-400">
              <Shield className="w-3 h-3 mr-1" />
              Trust & Security
            </Badge>
            <h2 className="text-xl font-bold">Trusted by <span className="gradient-text">500+</span> Businesses</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-3 border border-purple-500/20">
                  <badge.icon className="w-7 h-7 text-purple-400" />
                </div>
                <div className="font-medium text-sm">{badge.title}</div>
                <div className="text-xs text-muted-foreground">{badge.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Badge className="mb-3 bg-amber-500/10 border-amber-500/30 text-amber-400">
            <HelpCircle className="w-3 h-3 mr-1" />
            FAQs
          </Badge>
          <h2 className="text-2xl font-bold mb-2">Frequently Asked <span className="gradient-text">Questions</span></h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem 
                key={idx} 
                value={`item-${idx}`} 
                className="glass-card rounded-xl px-4 border-0 data-[state=open]:border-emerald-500/30 transition-all"
              >
                <AccordionTrigger className="hover:no-underline py-3 text-sm">
                  <span className="text-left font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-3">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
