'use client';

import { useEffect } from 'react';
import { 
  Twitter, Linkedin, Instagram, Mail, MapPin,
  Image as ImageIcon, ArrowRight, Heart, Globe,
  MessageCircle, Building2, HelpCircle, Facebook, Youtube
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PWALogo } from '@/components/Logo';

const services = [
  { name: 'Clipping Path', href: '/services/clipping-path' },
  { name: 'Image Editing', href: '/services/image' },
  { name: 'Video Editing', href: '/services/video' },
  { name: 'AI Operations', href: '/services/ai' },
  { name: 'Web Development', href: '/services/web' },
];

const company = [
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Studio', href: '/studio' },
  { name: 'Our Team', href: '/team' },
  { name: 'Contact Us', href: '/contact' },
];

const support = [
  { name: 'Help Center', href: '/support' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];

const socialLinks = [
  { name: 'LinkedIn', url: 'https://linkedin.com/company/clippingbd', icon: Linkedin },
  { name: 'Twitter', url: 'https://twitter.com/clippingbd', icon: Twitter },
  { name: 'Instagram', url: 'https://instagram.com/clippingbd', icon: Instagram },
  { name: 'Facebook', url: 'https://facebook.com/clippingbd', icon: Facebook },
  { name: 'YouTube', url: 'https://youtube.com/@clippingbd', icon: Youtube },
];

export function Footer() {
  const { systemSettings, isAuthenticated, setCurrentPage } = useAppStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleNavClick = (href: string) => {
    setCurrentPage(href);
    window.history.pushState({}, '', href);
    // Reset scroll position to top immediately and after a small delay
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
  };

  return (
    <footer className="mt-auto border-t border-border bg-theme-subtle dark:bg-slate-950/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <PWALogo size={56} />
              <div>
              <span className="text-lg font-bold gradient-text leading-tight block">ClippingPath & Website</span>
              <span className="text-lg font-bold gradient-text leading-tight block">Services Studio</span>
            </div>
            </div>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              Precision Clipping Paths • Professional Image & Video Editing • Complete Web Design & Development Solutions
            </p>
            
            {/* Newsletter */}
            <div className="space-y-3">
              <label htmlFor="newsletter-email" className="text-sm font-medium text-foreground">Subscribe to our newsletter</label>
              <div className="flex gap-2">
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-black/5 dark:bg-white/5 border-border focus:border-emerald-500/50"
                  aria-label="Email address for newsletter"
                />
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 px-4" aria-label="Subscribe to newsletter">
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          {/* Services */}
          <nav aria-label="Services links">
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <ImageIcon className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              Services
            </h4>
            <ul className="space-y-2">
              {services.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Building2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              Company
            </h4>
            <ul className="space-y-2">
              {company.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support links">
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <HelpCircle className="w-4 h-4 text-purple-400" aria-hidden="true" />
              Support
            </h4>
            <ul className="space-y-2">
              {support.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Contact Info - Updated with exact details */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <a 
              href="mailto:info@clippingbd.com" 
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Email: info@clippingbd.com</span>
            </a>
            <a 
              href="https://wa.me/8801749616724" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>WhatsApp: +880 1749 616724</span>
            </a>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>HQ: Chirirbandar, Dinajpur, Bangladesh</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Liaison: House 04, Road 1, B Block, Sayed Nagar, East Vatara, Dhaka</span>
            </div>
          </div>
          
          {/* Office Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-foreground">Main Headquarters & Production Hub:</span>
                <span className="ml-1">Chirirbandar, Dinajpur, Bangladesh - 24/7 Operations</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-foreground">Regional Liaison Office:</span>
                <span className="ml-1">House 04, Road 1, B Block, Sayed Nagar, East Vatara, Dhaka 1212 (Temporary)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2009 ClippingPath & Website Services Studio. All rights reserved.
          </p>
          
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
                className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made by Rakibul Hasan.
          </p>
        </div>
      </div>
    </footer>
  );
}
