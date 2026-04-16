'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Users, Lock, AlertCircle, CheckCircle, Mail, Globe, Clock, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { useAppStore } from '@/store/app-store';

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

// ============================================
// PRIVACY POLICY PAGE
// ============================================

export function PrivacyPolicyPage() {
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

  const lastUpdated = 'January 15, 2025';

  const sections = [
    {
      title: 'Information We Collect',
      icon: Users,
      content: [
        {
          subtitle: 'Personal Information',
          text: 'We collect information you provide directly to us, such as your name, email address, phone number, company name, and billing information when you create an account, place an order, or contact us for support.'
        },
        {
          subtitle: 'Usage Data',
          text: 'We automatically collect certain information when you use our Services, including your IP address, browser type, device information, pages viewed, and interaction with our services.'
        },
        {
          subtitle: 'Uploaded Content',
          text: 'When you upload images, videos, or other content to our platform for editing or processing, we temporarily store this content to provide our services. All uploaded content is handled securely and confidentially.'
        }
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: FileText,
      content: [
        {
          subtitle: 'Service Delivery',
          text: 'We use your information to provide, maintain, and improve our services, process your orders, and deliver the edited content you request.'
        },
        {
          subtitle: 'Communication',
          text: 'We use your contact information to send you updates about your orders, respond to your inquiries, and send promotional communications (with your consent).'
        },
        {
          subtitle: 'Security & Protection',
          text: 'We use your information to detect and prevent fraud, abuse, and other harmful activities, and to protect the security of our platform and users.'
        }
      ]
    },
    {
      title: 'Data Security',
      icon: Lock,
      content: [
        {
          subtitle: 'Encryption',
          text: 'All data transmitted between your device and our servers is encrypted using industry-standard TLS/SSL encryption. Your uploaded files are stored in encrypted form.'
        },
        {
          subtitle: 'Access Controls',
          text: 'We implement strict access controls so that only authorized personnel can access your data. Our editors and staff sign NDAs and are trained in data confidentiality.'
        },
        {
          subtitle: 'Secure Infrastructure',
          text: 'Our infrastructure is hosted on secure cloud platforms with enterprise-grade security measures, regular security audits, and compliance certifications.'
        }
      ]
    },
    {
      title: 'Your Rights & Choices',
      icon: CheckCircle,
      content: [
        {
          subtitle: 'Access & Export',
          text: 'You have the right to access and export your personal data. You can download your data through your account settings or by contacting us.'
        },
        {
          subtitle: 'Deletion',
          text: 'You can request deletion of your personal data. Upon account deletion, we will remove your data within 30 days, except where retention is required by law.'
        },
        {
          subtitle: 'Opt-Out',
          text: 'You can opt out of promotional communications at any time by clicking the unsubscribe link or adjusting your notification preferences in your account.'
        }
      ]
    },
    {
      title: 'Data Retention',
      icon: Clock,
      content: [
        {
          subtitle: 'Active Accounts',
          text: 'We retain your personal data for as long as your account is active. Uploaded files are retained for 30 days after project completion unless you request earlier deletion.'
        },
        {
          subtitle: 'After Account Closure',
          text: 'After account closure, we retain basic account information for 90 days to allow for potential account recovery, then securely delete all personal data.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'Some data may be retained longer if required by law or for legitimate business purposes such as dispute resolution or contract enforcement.'
        }
      ]
    },
    {
      title: 'Third-Party Services',
      icon: Globe,
      content: [
        {
          subtitle: 'Service Providers',
          text: 'We use trusted third-party services for payment processing (Stripe), cloud storage (AWS), and email delivery. These providers have their own privacy policies and security measures.'
        },
        {
          subtitle: 'No Data Selling',
          text: 'We never sell, rent, or trade your personal information to third parties. Your data is only shared as necessary to provide our services.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose your information if required by law, court order, or governmental regulation, or to protect our rights and the safety of our users.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mb-12"
        >
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            At ClippingPath & Website Services Studio, we take your privacy seriously. This policy describes how we collect,
            use, and protect your personal information when you use our services.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid sm:grid-cols-3 gap-4 mb-12"
        >
          {[
            { icon: Lock, label: 'Data Encryption', desc: '256-bit SSL/TLS' },
            { icon: Shield, label: 'GDPR Compliant', desc: 'EU data protection' },
            { icon: FileText, label: 'NDA Available', desc: 'On request' },
          ].map((item, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <GlassCard variant="default" padding="md" className="text-center border-emerald-500/10">
                <item.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-6"
        >
          {sections.map((section, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <GlassCard variant="default" padding="lg" className="border-emerald-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.content.map((item, subIdx) => (
                    <div key={subIdx} className="pl-4 border-l-2 border-emerald-500/20">
                      <h3 className="font-medium mb-1">{item.subtitle}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mt-12"
        >
          <GlassCard variant="premium" padding="lg" className="border-emerald-500/20">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Questions About Privacy?</h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions or concerns about our privacy practices, please don&apos;t hesitate to contact us.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
                  onClick={() => handleNavigate('/contact')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Privacy Team
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNavigate('/terms')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Terms of Service
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// TERMS OF SERVICE PAGE
// ============================================

export function TermsOfServicePage() {
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

  const lastUpdated = 'January 15, 2025';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      icon: CheckCircle,
      content: `By accessing or using ClippingPath & Website Services Studio's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.`
    },
    {
      title: '2. Description of Services',
      icon: FileText,
      content: `ClippingPath & Website Services Studio provides professional image editing, video editing, AI operations, and web development services. Our services include but are not limited to: clipping paths, background removal, photo retouching, color correction, video editing, motion graphics, AI-powered image processing, and custom web development solutions.`
    },
    {
      title: '3. Account Registration',
      icon: Users,
      content: `To access certain features of our services, you must register for an account. You agree to: provide accurate and complete information during registration; maintain the security of your account credentials; promptly update your account information if it changes; accept responsibility for all activities that occur under your account; and notify us immediately of any unauthorized use of your account.`
    },
    {
      title: '4. Orders and Payments',
      icon: Shield,
      content: `When placing an order, you agree to provide accurate specifications for the work required. Payment terms are as follows: standard orders require payment upon delivery; express and NITRO orders require upfront payment; all prices are in USD unless otherwise specified; we reserve the right to adjust pricing based on complexity assessment; and refunds are available within 7 days of delivery for unsatisfactory work, subject to our revision policy.`
    },
    {
      title: '5. Delivery and Revisions',
      icon: Clock,
      content: `Standard delivery timeframes are 24-48 hours. Express delivery (12-24h) and NITRO delivery (12h) are available at additional cost. All orders include unlimited revisions within 30 days of delivery. Revision requests must clearly specify the changes required. We reserve the right to determine if revision requests constitute new work outside the original scope.`
    },
    {
      title: '6. Intellectual Property',
      icon: Scale,
      content: `You retain ownership of all content you upload to our platform. Upon full payment, you receive full rights to the edited/processed deliverables. We retain the right to use before/after examples in our portfolio unless you request otherwise in writing. Our proprietary methods, workflows, and technologies remain our intellectual property.`
    },
    {
      title: '7. Confidentiality',
      icon: Lock,
      content: `We treat all client uploads and project details as confidential. Our team members sign NDAs and are trained in data confidentiality. We will not share, sell, or distribute your content to third parties. Confidentiality obligations survive termination of these terms and your use of our services.`
    },
    {
      title: '8. Acceptable Use',
      icon: AlertCircle,
      content: `You agree not to use our services for: illegal purposes or in violation of any laws; uploading content that infringes on third-party intellectual property rights; uploading content that is harmful, offensive, or inappropriate; attempting to circumvent security measures or access unauthorized data; interfering with the proper functioning of our services; or any purpose that could damage our reputation or operations.`
    },
    {
      title: '9. Limitation of Liability',
      icon: Shield,
      content: `To the maximum extent permitted by law, ClippingPath & Website Services Studio shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities. Our total liability shall not exceed the amount paid by you for the specific service giving rise to the claim.`
    },
    {
      title: '10. Termination',
      icon: Globe,
      content: `We reserve the right to terminate or suspend your account and access to services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason. Upon termination, your right to use the services will immediately cease.`
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mb-12"
        >
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Please read these terms carefully before using our services. By using ClippingPath & Website Services Studio,
            you agree to be bound by these terms.
          </p>
        </motion.div>

        {/* Quick Summary */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mb-12"
        >
          <GlassCard variant="premium" padding="lg" className="border-cyan-500/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              Quick Summary
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Unlimited revisions within 30 days</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Full IP rights upon payment</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Confidential handling guaranteed</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>7-day refund policy</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-6"
        >
          {sections.map((section, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <GlassCard variant="default" padding="lg" className="border-cyan-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed pl-13">
                  {section.content}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mt-12"
        >
          <GlassCard variant="premium" padding="lg" className="border-cyan-500/20">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Questions About Our Terms?</h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions about our Terms of Service, please contact our legal team.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0"
                  onClick={() => handleNavigate('/contact')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Legal Team
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNavigate('/privacy')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  View Privacy Policy
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Agreement Notice */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            By using ClippingPath & Website Services Studio, you acknowledge that you have read, understood, and agree
            to be bound by these Terms of Service.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
