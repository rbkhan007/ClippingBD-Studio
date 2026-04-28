'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Phone, MapPin, Clock, Send, MessageSquare, Building,
  Globe, Headphones, Zap, CheckCircle, ArrowRight, Sparkles,
  Linkedin, Twitter, Instagram, Facebook, Youtube, Calendar,
  ExternalLink, Navigation, Award, Users, Target, Timer,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAppStore } from '@/store/app-store';
import { useToast } from '@/hooks/use-toast';

// Contact Information - Updated with real details
const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'info@clippingbd.com',
    href: 'mailto:info@clippingbd.com',
    description: 'We respond within 5 minutes',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: '+880 1749 616724',
    href: 'https://wa.me/8801749616724',
    description: 'Direct line for instant support',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+880 1749 616724',
    href: 'tel:+8801749616724',
    description: 'Available 24/7',
    gradient: 'from-teal-500 to-cyan-600'
  },
  {
    icon: Clock,
    title: 'Working Hours',
    value: '24/7 Support',
    href: null,
    description: 'Always here for you',
    gradient: 'from-cyan-500 to-blue-600'
  }
];

// Office Locations - Updated with real addresses
const officeLocations = [
  {
    city: 'Chirirbandar',
    region: 'Dinajpur',
    country: 'Bangladesh',
    name: 'Main Headquarters',
    address: 'Chirirbandar, Dinajpur, Bangladesh',
    role: 'Core operations and administration',
    phone: '+880 1749 616724',
    email: 'info@clippingbd.com',
    timezone: 'BST (UTC+6)',
    hours: '24/7 Operations',
    gradient: 'from-emerald-500 to-teal-600',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d634.2486325842958!2d88.7784571879712!3d25.645627750137752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fb55ee20aeb7cb%3A0xf1b78ab2561b4a3!2sClippingbd!5e1!3m2!1sen!2sbd!4v1775835387650!5m2!1sen!2sbd',
    isPrimary: true
  },
  {
    city: 'Chirirbandar',
    region: 'Dinajpur',
    country: 'Bangladesh',
    name: 'Production Hub',
    address: 'Chirirbandar, Dinajpur, Bangladesh',
    role: 'Technical execution and service delivery',
    phone: '+880 1749 616724',
    email: 'info@clippingbd.com',
    timezone: 'BST (UTC+6)',
    hours: '24/7 Production',
    gradient: 'from-teal-500 to-cyan-600',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d634.2486325842958!2d88.7784571879712!3d25.645627750137752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fb555edeb749bf%3A0xfb095bfd38ad51a7!2sDev%20Office%20-%20Full%20Stack%20Solutions%20%7C%20Rakibul%20Hasan!5e1!3m2!1sen!2sbd!4v1775835823772!5m2!1sen!2sbd',
    isPrimary: false
  },
  {
    city: 'Dhaka',
    region: 'East Vatara',
    country: 'Bangladesh',
    name: 'Regional Liaison Office',
    address: 'House 04, Road 1, B Block, Sayed Nagar, East Vatara, Dhaka 1212',
    role: 'Regional coordination (Temporary)',
    phone: '+880 1749 616724',
    email: 'info@clippingbd.com',
    timezone: 'BST (UTC+6)',
    hours: 'Mon-Sat 9AM-6PM',
    gradient: 'from-cyan-500 to-blue-600',
    mapEmbed: null,
    isPrimary: false,
    isTemporary: true
  }
];

// Professional KPIs
const kpiStats = [
  { 
    value: '500+', 
    label: 'Global Projects Completed', 
    icon: Target,
    description: 'Across 120+ countries'
  },
  { 
    value: '99%', 
    label: 'Client Satisfaction Rate', 
    icon: Award,
    description: 'Industry-leading quality'
  },
  { 
    value: '24-Hour', 
    label: 'Standard Turnaround', 
    icon: Timer,
    description: 'Express available'
  },
  { 
    value: '15+', 
    label: 'Expert Specialists', 
    icon: Users,
    description: 'Full-stack professionals'
  },
];

const socialLinks = [
  { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/clippingbd', color: 'hover:bg-blue-600' },
  { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/clippingbd', color: 'hover:bg-sky-500' },
  { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/clippingbd', color: 'hover:bg-pink-600' },
  { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/clippingbd', color: 'hover:bg-blue-700' },
  { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/@clippingbd', color: 'hover:bg-red-600' }
];

const inquiryTypes = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'quote', label: 'Request a Quote' },
  { value: 'support', label: 'Technical Support' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'enterprise', label: 'Enterprise Solutions' },
  { value: 'careers', label: 'Careers' }
];

const faqs = [
  {
    question: 'What is your typical turnaround time?',
    answer: 'Standard delivery is 24 hours. We also offer express 12-hour delivery (Nitro) for urgent projects. Our production hub operates 24/7 to meet global deadlines.'
  },
  {
    question: 'Do you offer free trials?',
    answer: 'Yes! We offer free test images for new clients. No credit card required. Upload your images and see the quality yourself before committing.'
  },
  {
    question: 'What services do you offer?',
    answer: 'We provide comprehensive image editing services including clipping path, background removal, retouching, color correction, image masking, and video editing. We also offer web development services.'
  },
  {
    question: 'How do I get a custom quote?',
    answer: 'Upload your images through our client portal and our system will automatically generate a quote. For complex projects, contact our sales team directly via WhatsApp or email.'
  }
];

// Business hours by region
const businessHours = [
  {
    region: 'Asia Pacific',
    timezone: 'BST (UTC+6)',
    hours: [
      { day: 'Monday - Saturday', time: '24/7 Operations' },
      { day: 'Sunday', time: '24/7 Support' },
    ],
    support: 'Production Hub - Bangladesh'
  },
  {
    region: 'North America',
    timezone: 'EST (UTC-5)',
    hours: [
      { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
      { day: 'Weekend', time: 'Support Available' },
    ],
    support: '24/7 Chat Support'
  },
  {
    region: 'Europe',
    timezone: 'GMT (UTC+0)',
    hours: [
      { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
      { day: 'Weekend', time: 'Support Available' },
    ],
    support: '24/7 Chat Support'
  },
  {
    region: 'Middle East',
    timezone: 'GST (UTC+4)',
    hours: [
      { day: 'Monday - Saturday', time: '9:00 AM - 9:00 PM' },
      { day: 'Sunday', time: 'Support Available' },
    ],
    support: 'Priority Support'
  }
];

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSubmitted(true);
        toast({
          title: 'Message Sent!',
          description: data.message || 'We\'ll get back to you within 5 minutes.',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%)' }}
            animate={{ 
              scale: [1, 1.2, 1],
              y: [0, 50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 60%)' }}
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, 30, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 px-5 py-2 text-sm">
              <Headphones className="w-4 h-4 mr-2" />
              Get In Touch
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Let's Start a <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Conversation</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond 
              as soon as possible. Average response time: 5 minutes.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {contactInfo.map((info, idx) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card h-full hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <a href={info.href || '#'} className="block">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <info.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">{info.title}</h3>
                      <p className="text-emerald-400 font-medium mb-1 hover:underline">{info.value}</p>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* KPI Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {kpiStats.map((stat, idx) => (
              <Card key={stat.label} className="glass-card border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                <CardContent className="p-4 text-center">
                  <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Why Choose Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold mb-3">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Precision Meets Innovation</span>
            </h2>
            <p className="text-muted-foreground">
              We bridge the gap between complex technical requirements and elegant digital solutions. 
              From our main operations in Dinajpur to our strategic presence in Dhaka, we deliver 
              world-class professional services tailored to the evolving needs of the global market.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-emerald-500/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                  
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-6">We&apos;ll get back to you within 5 minutes.</p>
                      <Button
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({
                            name: '', email: '', company: '', phone: '',
                            inquiryType: '', subject: '', message: ''
                          });
                        }}
                        variant="outline"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="John Doe"
                            required
                            className="bg-black/5 dark:bg-white/5 border-border focus:border-emerald-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john@company.com"
                            required
                            className="bg-black/5 dark:bg-white/5 border-border focus:border-emerald-500/50"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            placeholder="Company Name"
                            className="bg-black/5 dark:bg-white/5 border-border focus:border-emerald-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone / WhatsApp</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+880 1XXX-XXXXXX"
                            className="bg-black/5 dark:bg-white/5 border-border focus:border-emerald-500/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiryType">Inquiry Type</Label>
                        <Select onValueChange={(value) => handleInputChange('inquiryType', value)}>
                          <SelectTrigger className="bg-black/5 dark:bg-white/5 border-border focus:border-emerald-500/50">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                            {inquiryTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="How can we help?"
                          required
                          className="bg-black/5 dark:bg-white/5 border-border focus:border-emerald-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Tell us more about your project..."
                          rows={5}
                          required
                          className="bg-black/5 dark:bg-white/5 border-border focus:border-emerald-500/50 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Side - Quick FAQs & Social */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Quick FAQs */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-emerald-400" />
                  Quick Answers
                </h2>
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <Card key={idx} className="glass-card hover:border-emerald-500/30 transition-all duration-300">
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          {faq.question}
                        </h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4">Connect With Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map(social => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white dark:hover:text-white ${social.color} transition-all`}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Office Locations with Google Maps */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-3 bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
              <Navigation className="w-3 h-3 mr-1" />
              Our Locations
            </Badge>
            <h2 className="text-3xl font-bold mb-2">Office <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Locations</span></h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              From our headquarters in Dinajpur to our regional office in Dhaka, we serve clients across 120+ countries worldwide.
            </p>
          </motion.div>

          {/* Office Cards with Maps */}
          <div className="space-y-8">
            {officeLocations.map((office, idx) => (
              <motion.div
                key={office.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`glass-card overflow-hidden ${office.isPrimary ? 'border-emerald-500/30' : 'hover:border-emerald-500/30'} transition-all`}>
                  <div className="grid lg:grid-cols-2">
                    {/* Office Info */}
                    <CardContent className="p-6 lg:p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${office.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold">{office.name}</h3>
                            {office.isPrimary && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                Main HQ
                              </Badge>
                            )}
                            {office.isTemporary && (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                                Temporary
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{office.city}, {office.country}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Address</p>
                            <p className="text-sm text-muted-foreground">{office.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Phone</p>
                            <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="text-sm text-emerald-400 hover:underline">
                              {office.phone}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <a href={`mailto:${office.email}`} className="text-sm text-emerald-400 hover:underline">
                              {office.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Working Hours</p>
                            <p className="text-sm text-muted-foreground">{office.hours} ({office.timezone})</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        >
                          <a href={`https://wa.me/8801749616724`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </a>
                        </Button>
                        {office.mapEmbed && (
                          <Button
                            variant="outline"
                            asChild
                            className="border-emerald-500/30 hover:bg-emerald-500/10"
                          >
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Get Directions
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>

                    {/* Map */}
                    {office.mapEmbed && (
                      <div className="h-64 lg:h-auto min-h-[300px] bg-muted/30">
                        <iframe
                          src={office.mapEmbed}
                          width="100%"
                          height="100%"
                          style={{ border: 0, minHeight: '300px' }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`${office.name} - ClippingBD`}
                          className="grayscale hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                    )}
                    {!office.mapEmbed && (
                      <div className="h-64 lg:h-auto min-h-[300px] bg-muted/30 flex items-center justify-center">
                        <div className="text-center p-6">
                          <MapPin className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground text-sm">Map coming soon</p>
                          <p className="text-xs text-muted-foreground mt-1">Temporary office location</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <Badge className="mb-3 bg-amber-500/10 border-amber-500/30 text-amber-400">
              <Calendar className="w-3 h-3 mr-1" />
              Availability
            </Badge>
            <h2 className="text-2xl font-bold mb-2">Business <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Hours</span></h2>
            <p className="text-muted-foreground text-sm">24/7 support available for global clients</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {businessHours.map((region, idx) => (
              <motion.div
                key={region.region}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card h-full hover:border-emerald-500/30 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-semibold">{region.region}</h3>
                    </div>
                    <Badge variant="outline" className="text-xs mb-3 border-slate-600 text-muted-foreground">
                      {region.timezone}
                    </Badge>
                    <div className="space-y-1 text-sm mb-3">
                      {region.hours.map((schedule, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground">{schedule.day}</span>
                          <span className="font-medium">{schedule.time}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        {region.support}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              Ready to <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Transform</span> Your Visual Content?
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join 500+ businesses that trust ClippingBD for their image editing needs. 
              Start with free test images today.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
                onClick={() => handleNavigate('/auth')}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-border hover:bg-black/5 dark:bg-white/5"
                onClick={() => handleNavigate('/pricing')}
              >
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
