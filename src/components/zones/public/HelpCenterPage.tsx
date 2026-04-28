'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, HelpCircle, MessageSquare, FileText, ChevronDown, ChevronRight,
  Mail, Phone, Clock, Search, ExternalLink, CheckCircle, Zap, Image as ImageIcon, Video,
  Bot, Globe, CreditCard, Shield, Users, Upload, Download, AlertCircle, Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

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

// FAQ Categories
const faqCategories = [
  {
    title: 'Getting Started',
    icon: Zap,
    faqs: [
      {
        question: 'How do I place my first order?',
        answer: 'Simply create a free account, click "New Order", and follow our 5-step wizard. Upload your files, specify your requirements, choose your delivery priority, and confirm. It\'s that easy!'
      },
      {
        question: 'What file formats do you accept?',
        answer: 'We accept all major image formats including JPG, PNG, TIFF, PSD, RAW, AI, and EPS. For video, we accept MP4, MOV, AVI, and more. If you have a different format, contact us.'
      },
      {
        question: 'Is there a free trial?',
        answer: 'Yes! New users get 5 free image edits to test our quality. No credit card required. Sign up and start your trial today.'
      }
    ]
  },
  {
    title: 'Image Services',
    icon: ImageIcon,
    faqs: [
      {
        question: 'What is a clipping path?',
        answer: 'A clipping path is a vector outline that separates the subject from the background. It allows for clean background removal and is essential for e-commerce product images.'
      },
      {
        question: 'What\'s the difference between simple and complex clipping paths?',
        answer: 'Simple paths are for basic shapes with smooth edges. Complex paths are needed for intricate subjects like jewelry, trees, or hair. Pricing adjusts based on complexity.'
      },
      {
        question: 'Can you match my brand\'s specific color requirements?',
        answer: 'Absolutely! We can match Pantone colors, HEX codes, or reference images. Just provide your brand guidelines or specific requirements in your order.'
      }
    ]
  },
  {
    title: 'Video Services',
    icon: Video,
    faqs: [
      {
        question: 'What types of video editing do you offer?',
        answer: 'We offer color grading, motion graphics, transitions, subtitles, audio syncing, special effects, and complete post-production services.'
      },
      {
        question: 'What video resolution do you support?',
        answer: 'We support all resolutions from SD to 8K. We deliver in your preferred format and resolution, optimized for your platform (web, TV, social media).'
      },
      {
        question: 'How long does video editing take?',
        answer: 'Standard turnaround is 24-48 hours for most projects. Complex videos may require more time. Express and NITRO (12h) options are available.'
      }
    ]
  },
  {
    title: 'Pricing & Billing',
    icon: CreditCard,
    faqs: [
      {
        question: 'How is pricing calculated?',
        answer: 'Pricing depends on service type, complexity, quantity, and delivery speed. Images start at $0.20 for simple clipping paths. Use our quote calculator for accurate estimates.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for enterprise clients. All payments are processed securely via Stripe.'
      },
      {
        question: 'Do you offer volume discounts?',
        answer: 'Yes! We offer tiered discounts based on monthly volume. Contact our sales team for enterprise pricing and custom quotes.'
      }
    ]
  },
  {
    title: 'Delivery & Revisions',
    icon: Clock,
    faqs: [
      {
        question: 'What are your delivery timeframes?',
        answer: 'Standard: 24-48 hours. Express: 12-24 hours (+15%). NITRO: 12 hours (+25%). Custom deadlines available for large projects.'
      },
      {
        question: 'How do revisions work?',
        answer: 'All orders include unlimited revisions within 30 days of delivery. Simply mark up the images with your feedback, and we\'ll make the changes promptly.'
      },
      {
        question: 'What if I need urgent changes after delivery?',
        answer: 'We understand deadlines happen. Contact your dedicated account manager or use our NITRO revision option for priority handling.'
      }
    ]
  },
  {
    title: 'Security & Privacy',
    icon: Shield,
    faqs: [
      {
        question: 'Is my data secure?',
        answer: 'Absolutely. All files are encrypted in transit and at rest. Our team signs NDAs, and we\'re GDPR compliant. Your content is never shared or used without permission.'
      },
      {
        question: 'Do you sign NDAs?',
        answer: 'Yes, we can sign NDAs for any project. Just send us your agreement or request our standard NDA template.'
      },
      {
        question: 'How long do you keep my files?',
        answer: 'Files are retained for 30 days after project completion. You can request immediate deletion at any time through your dashboard.'
      }
    ]
  }
];

// Quick links
const quickLinks = [
  { title: 'Create Account', href: '/auth', icon: Users, color: 'emerald' },
  { title: 'View Pricing', href: '/pricing', icon: CreditCard, color: 'cyan' },
  { title: 'Browse Portfolio', href: '/portfolio', icon: ImageIcon, color: 'violet' },
  { title: 'Contact Sales', href: '/contact', icon: Mail, color: 'orange' },
];

export function HelpCenterPage() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [dbFaqs, setDbFaqs] = useState<{question: string; answer: string; category: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/cms/faq?isPublished=true', { next: { revalidate: 60 } });
        const data = await response.json();
        if (data.success && data.faqItems) {
          setDbFaqs(data.faqItems);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // Group database FAQs by category
  const faqCategoriesFromDb = dbFaqs.reduce((acc, faq) => {
    const cat = faq.category || 'GENERAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, typeof dbFaqs>);

  // Use database FAQs if available, otherwise fall back to static
  const displayFaqCategories = dbFaqs.length > 0
    ? Object.entries(faqCategoriesFromDb).map(([category, faqs], idx) => ({
        title: category.charAt(0) + category.slice(1).toLowerCase(),
        faqs: faqs.map(f => ({ question: f.question, answer: f.answer })),
        icon: [Zap, ImageIcon, Video, CreditCard, Headphones][idx % 5],
      }))
    : faqCategories;

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

  const filteredFaqs = searchQuery
    ? displayFaqCategories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.faqs.length > 0)
    : displayFaqCategories;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <button
            onClick={() => handleNavigate('/')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions, learn about our services, and get the help you need.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-muted/30 dark:bg-white/5 border-border focus:border-emerald-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {quickLinks.map((link, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <button
                onClick={() => handleNavigate(link.href)}
                className="w-full"
              >
                <GlassCard
                  variant="hover-lift"
                  padding="md"
                  className={cn(
                    "border-transition cursor-pointer text-left w-full",
                    `border-${link.color}-500/10 hover:border-${link.color}-500/30`
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      `bg-${link.color}-500/10`
                    )}>
                      <link.icon className={cn("w-5 h-5", `text-${link.color}-400`)} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{link.title}</div>
                      <div className="text-xs text-muted-foreground">Learn more</div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </div>
                </GlassCard>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {filteredFaqs.map((category, catIdx) => (
              <GlassCard
                key={catIdx}
                variant="default"
                padding="none"
                className="border-emerald-500/10 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedCategory(expandedCategory === catIdx ? null : catIdx)}
                  className="w-full p-4 sm:p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.faqs.length} questions</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      expandedCategory === catIdx && "rotate-180"
                    )}
                  />
                </button>

                {expandedCategory === catIdx && (
                  <div className="border-t border-border">
                    {category.faqs.map((faq, faqIdx) => (
                      <div key={faqIdx} className="border-b border-border last:border-0">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === `${catIdx}-${faqIdx}` ? null : `${catIdx}-${faqIdx}`)}
                          className="w-full p-4 sm:px-6 flex items-start justify-between text-left"
                        >
                          <span className="font-medium pr-4">{faq.question}</span>
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform",
                              expandedFaq === `${catIdx}-${faqIdx}` && "rotate-90"
                            )}
                          />
                        </button>
                        {expandedFaq === `${catIdx}-${faqIdx}` && (
                          <div className="px-4 sm:px-6 pb-4 -mt-2">
                            <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mb-12"
        >
          <GlassCard variant="premium" padding="lg" className="border-emerald-500/20">
            <div className="text-center mb-8">
              <AlertCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-muted-foreground">
                Our support team is available 24/7 to assist you with any questions.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-sm text-muted-foreground mb-2">support@clippingbd.com</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('/contact')}
                  className="border-emerald-500/30 hover:border-emerald-500"
                >
                  Send Email
                </Button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-2">Available 24/7</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/30 hover:border-cyan-500"
                >
                  Start Chat
                </Button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-sm text-muted-foreground mb-2">+1 (555) 123-4567</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-violet-500/30 hover:border-violet-500"
                >
                  Schedule Call
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="text-center"
        >
          <GlassCard variant="default" padding="lg" className="border-emerald-500/20">
            <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of businesses that trust ClippingBD for their editing needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
                onClick={() => handleNavigate('/auth')}
              >
                Create Free Account
              </Button>
              <Button
                variant="outline"
                onClick={() => handleNavigate('/pricing')}
              >
                View Pricing
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
