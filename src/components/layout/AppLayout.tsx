'use client';

import { useEffect, useState } from 'react';
import { useAppStore, getDashboardPath } from '@/store/app-store';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, isHydrated, logout, currentPage, setCurrentPage } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle URL-based routing on initial load
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== currentPage) {
      setCurrentPage(path);
    }

    // Handle browser back/forward
    const handlePopState = () => {
      setCurrentPage(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage, setCurrentPage]);

  // Navigate to stored page
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

  // Don't render until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const showSidebar = isAuthenticated && user && user.role !== 'GUEST';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        {showSidebar && user && (
          <Sidebar
            user={user}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogout={logout}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}
        
        <main className={cn(
          "flex-1 transition-all duration-300",
          showSidebar && (sidebarOpen ? "ml-64" : "ml-[72px]")
        )}>
          <div className="min-h-[calc(100vh-4rem)]">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
