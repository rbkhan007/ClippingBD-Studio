'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useInitializeCmsSettings, useAppSettings } from '@/store/app-settings';

interface DynamicPageWrapperProps {
  children: ReactNode;
  showRealtimeIndicator?: boolean;
  enableScrollEffects?: boolean;
}

export function DynamicPageWrapper({ 
  children, 
  showRealtimeIndicator = true,
  enableScrollEffects = true 
}: DynamicPageWrapperProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializeCmsSettings = useInitializeCmsSettings();

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        await initializeCmsSettings();
        setError(null);
      } catch (err) {
        console.error('Error initializing CMS:', err);
        setError('Failed to load settings. Using defaults.');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [initializeCmsSettings]);

  useEffect(() => {
    if (!enableScrollEffects) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollEffects]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2"
        >
          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button 
              onClick={() => window.location.reload()}
              className="ml-2 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {typeof children === 'function' 
          ? (children as (props: { scrollY: number }) => ReactNode)({ scrollY })
          : children
        }
      </motion.div>
    </div>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.1 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
