'use client';

import { lazy, Suspense, useSyncExternalStore, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Logo } from '@/components/Logo';

// Loading skeleton component - instant render
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Logo size={140} showIcons={false} animateRing={true} animateNib={true} variant="nav" />
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-teal-500"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-cyan-500"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </div>
);
}

// Empty subscription for hydration
const emptySubscribe = (onStoreChange: () => void) => () => { onStoreChange(); };
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// Lazy load all pages - defined before use
const HomePage = lazy(() => import('@/components/zones/public/HomePage').then(m => ({ default: m.HomePage })));
const ServicesPage = lazy(() => import('@/components/zones/public/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ClippingPathServicePage = lazy(() => import('@/components/zones/public/ServicesPage').then(m => ({ default: m.ClippingPathServicePage })));
const ImageServicePage = lazy(() => import('@/components/zones/public/ServicesPage').then(m => ({ default: m.ImageServicePage })));
const VideoServicePage = lazy(() => import('@/components/zones/public/ServicesPage').then(m => ({ default: m.VideoServicePage })));
const AIServicePage = lazy(() => import('@/components/zones/public/ServicesPage').then(m => ({ default: m.AIServicePage })));
const WebServicePage = lazy(() => import('@/components/zones/public/ServicesPage').then(m => ({ default: m.WebServicePage })));
const PricingPage = lazy(() => import('@/components/zones/public/PricingPage').then(m => ({ default: m.PricingPage })));
const PortfolioPage = lazy(() => import('@/components/zones/public/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const StudioPage = lazy(() => import('@/components/zones/public/StudioPage').then(m => ({ default: m.StudioPage })));
const TeamsPage = lazy(() => import('@/components/zones/public/TeamsPage').then(m => ({ default: m.TeamsPage })));
const ContactPage = lazy(() => import('@/components/zones/public/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPolicyPage = lazy(() => import('@/components/zones/public/LegalPages').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('@/components/zones/public/LegalPages').then(m => ({ default: m.TermsOfServicePage })));
const HelpCenterPage = lazy(() => import('@/components/zones/public/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })));
const AuthPages = lazy(() => import('@/components/zones/auth/AuthPages').then(m => ({ default: m.AuthPages })));
const ClientPages = lazy(() => import('@/components/zones/client/ClientPages').then(m => ({ default: m.ClientPages })));
const EditorPages = lazy(() => import('@/components/zones/editor/EditorPages').then(m => ({ default: m.EditorPages })));
const QAPages = lazy(() => import('@/components/zones/qa/QAPages').then(m => ({ default: m.QAPages })));
const AdminPages = lazy(() => import('@/components/zones/admin/AdminPages').then(m => ({ default: m.AdminPages })));
const DevPages = lazy(() => import('@/components/zones/dev/DevPages').then(m => ({ default: m.DevPages })));

// Home page component - uses CMS content internally
function HomePageComponent() {
  return <HomePage />;
}

// Page Router Component
function PageRouter({ currentPage, isAuthenticated, user }: { 
  currentPage: string; 
  isAuthenticated: boolean; 
  user: any;
}) {
  // Public pages
  if (currentPage === '/' || currentPage === '') {
    return <HomePageComponent />;
  }
  
  // Services - Individual pages with specific categories
  if (currentPage === '/services/clipping-path') {
    return <ClippingPathServicePage />;
  }
  if (currentPage === '/services/image') {
    return <ImageServicePage />;
  }
  if (currentPage === '/services/video') {
    return <VideoServicePage />;
  }
  if (currentPage === '/services/ai') {
    return <AIServicePage />;
  }
  if (currentPage === '/services/web') {
    return <WebServicePage />;
  }
  // Main services overview page
  if (currentPage === '/services' || currentPage.startsWith('/services')) {
    return <ServicesPage />;
  }
  
  // Pricing
  if (currentPage === '/pricing') {
    return <PricingPage />;
  }
  
  // Portfolio
  if (currentPage === '/portfolio') {
    return <PortfolioPage />;
  }
  
  // Studio (public gallery)
  if (currentPage === '/studio') {
    return <StudioPage />;
  }
  
  // Team page
  if (currentPage === '/team') {
    return <TeamsPage />;
  }
  
  // Contact page
  if (currentPage === '/contact') {
    return <ContactPage />;
  }
  
  // Privacy Policy page
  if (currentPage === '/privacy') {
    return <PrivacyPolicyPage />;
  }
  
  // Terms of Service page
  if (currentPage === '/terms') {
    return <TermsOfServicePage />;
  }
  
  // Help Center page (public) - shown when not authenticated
  // When authenticated, /support is handled by ClientPages
  if (currentPage === '/support' && !isAuthenticated) {
    return <HelpCenterPage />;
  }
  
  // Auth pages
  if (currentPage.startsWith('/auth')) {
    return <AuthPages />;
  }
  
  // Protected pages - require authentication
  if (isAuthenticated && user) {
    // Client pages
    if (currentPage.startsWith('/brief') || 
        currentPage.startsWith('/orders') || 
        currentPage.startsWith('/messages') ||
        currentPage.startsWith('/profile') ||
        currentPage.startsWith('/billing') ||
        currentPage.startsWith('/support') ||
        currentPage.startsWith('/assets') ||
        currentPage.startsWith('/projects') ||
        (currentPage === '/dashboard' && user.role === 'CLIENT')) {
      return <ClientPages />;
    }
    
    // Editor pages
    if (user.role === 'EDITOR' && (
      currentPage.startsWith('/editor') ||
      currentPage === '/dashboard'
    )) {
      return <EditorPages />;
    }
    
    // QA pages
    if (user.role === 'QA' && (
      currentPage.startsWith('/qa') ||
      currentPage === '/dashboard'
    )) {
      return <QAPages />;
    }
    
    // Admin pages
    if (user.role === 'ADMIN' && (
      currentPage.startsWith('/admin') ||
      currentPage.startsWith('/users') ||
      currentPage.startsWith('/settings') ||
      currentPage.startsWith('/cms') ||
      currentPage.startsWith('/statistics') ||
      currentPage === '/dashboard'
    )) {
      return <AdminPages />;
    }
    
    // Developer pages
    if (user.role === 'DEVELOPER' && (
      currentPage.startsWith('/dev') ||
      currentPage.startsWith('/system') ||
      currentPage.startsWith('/logs') ||
      currentPage === '/dashboard'
    )) {
      return <DevPages />;
    }
    
    // Default dashboard based on role
    if (currentPage === '/dashboard') {
      switch (user.role) {
        case 'CLIENT': return <ClientPages />;
        case 'EDITOR': return <EditorPages />;
        case 'QA': return <QAPages />;
        case 'ADMIN': return <AdminPages />;
        case 'DEVELOPER': return <DevPages />;
        default: return <ClientPages />;
      }
    }
  }
  
  // Fallback to home
  return <HomePage />;
}

export default function Page() {
  const { currentPage, isAuthenticated, user, setCurrentPage } = useAppStore();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  // Sync currentPage with browser URL on mount and history navigation
  useEffect(() => {
    // Set initial page from URL
    const path = window.location.pathname;
    if (path && path !== currentPage) {
      setCurrentPage(path);
    }

    // Handle browser back/forward navigation
    const handlePopState = () => {
      const newPath = window.location.pathname;
      setCurrentPage(newPath);
      // Reset scroll to top on navigation - immediate and delayed
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentPage]);

  if (!mounted) {
    return <PageLoader />;
  }

  // Determine if current page is a dashboard/admin page (no footer needed)
  const isDashboardPage = isAuthenticated && user && (
    currentPage.startsWith('/admin') ||
    currentPage.startsWith('/editor') ||
    currentPage.startsWith('/qa') ||
    currentPage.startsWith('/dev') ||
    currentPage.startsWith('/brief') ||
    currentPage.startsWith('/billing') ||
    currentPage === '/dashboard'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Auto-hiding Navbar */}
      <Navbar />
      
      {/* Main Content with top padding for fixed navbar */}
      <main className={`flex-1 ${isDashboardPage ? '' : 'pt-16'}`}>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PageRouter 
                currentPage={currentPage} 
                isAuthenticated={isAuthenticated} 
                user={user} 
              />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      
      {/* Footer - only shown on public pages */}
      {!isDashboardPage && <Footer />}
    </div>
  );
}