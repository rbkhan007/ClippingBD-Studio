'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme-store';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch' | 'dropdown' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

function applyTheme(theme: string) {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem('clippingbd-theme', JSON.stringify({ state: { theme } }));
}

function getStoredTheme(): string {
  try {
    const stored = localStorage.getItem('clippingbd-theme');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state && parsed.state.theme) {
        return parsed.state.theme;
      }
    }
  } catch (e) {
    // ignore
  }
  return 'dark';
}

function getInitialTheme(): string {
  if (typeof window === 'undefined') return 'dark';
  return getStoredTheme();
}

export function ThemeToggle({
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');

  useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    setCurrentTheme(stored);
    setTheme(stored as 'light' | 'dark');
  }, [setTheme]);

  const handleToggle = useCallback(() => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    setCurrentTheme(newTheme);
    setTheme(newTheme as 'light' | 'dark');
  }, [currentTheme, setTheme]);

  const actualTheme = mounted ? currentTheme : 'dark';

  if (!mounted) {
    return (
      <div className={cn(
        'rounded-full bg-slate-200/50 dark:bg-white/5 animate-pulse',
        sizes[size]
      )} />
    );
  }

  // Icon variant - simple icon button
  if (variant === 'icon') {
    return (
      <motion.button
        onClick={handleToggle}
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'bg-slate-100 dark:bg-white/10',
          'border border-slate-200 dark:border-white/10',
          'hover:bg-slate-200 dark:hover:bg-white/20',
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-emerald-500/50',
          sizes[size],
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} theme`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {actualTheme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className={cn('text-amber-500', iconSizes[size])} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className={cn('text-slate-600', iconSizes[size])} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Switch variant - toggle switch
  if (variant === 'switch') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          'relative flex items-center gap-3 p-1 rounded-full',
          'bg-slate-200 dark:bg-slate-800',
          'border border-slate-300 dark:border-white/10',
          'transition-all duration-300',
          className
        )}
        aria-label={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} theme`}
      >
        <span className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          actualTheme === 'dark' ? 'text-amber-400' : 'text-slate-400'
        )}>
          <Moon className="w-4 h-4" />
        </span>
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 dark:from-emerald-500 dark:to-teal-600 shadow-lg"
          animate={{
            x: actualTheme === 'dark' ? 0 : 40,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
        <span className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full mr-1',
          actualTheme === 'light' ? 'text-amber-500' : 'text-slate-500'
        )}>
          <Sun className="w-4 h-4" />
        </span>
      </button>
    );
  }

  // Pill variant - pill with label
  if (variant === 'pill') {
    return (
      <motion.button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full',
          'bg-slate-100 dark:bg-white/10',
          'border border-slate-200 dark:border-white/10',
          'hover:bg-slate-200 dark:hover:bg-white/20',
          'transition-all duration-300',
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} theme`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {actualTheme === 'dark' ? (
            <motion.div
              key="sun-pill"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Sun className="w-4 h-4 text-amber-500" />
              {showLabel && <span className="text-sm font-medium text-foreground">Light</span>}
            </motion.div>
          ) : (
            <motion.div
              key="moon-pill"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Moon className="w-4 h-4 text-slate-600" />
              {showLabel && <span className="text-sm font-medium text-foreground">Dark</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Dropdown variant (simplified - just shows both options)
  if (variant === 'dropdown') {
    return (
      <div className={cn('flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10', className)}>
        <button
          onClick={() => {
            applyTheme('light');
            setCurrentTheme('light');
            useThemeStore.getState().setTheme('light');
          }}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
            actualTheme === 'light'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg'
              : 'hover:bg-slate-200 dark:hover:bg-white/5 text-muted-foreground'
          )}
        >
          <Sun className="w-4 h-4" />
          <span className="text-sm font-medium">Light</span>
        </button>
        <button
          onClick={() => {
            applyTheme('dark');
            setCurrentTheme('dark');
            useThemeStore.getState().setTheme('dark');
          }}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
            actualTheme === 'dark'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : 'hover:bg-slate-200 dark:hover:bg-white/5 text-muted-foreground'
          )}
        >
          <Moon className="w-4 h-4" />
          <span className="text-sm font-medium">Dark</span>
        </button>
      </div>
    );
  }

  return null;
}

// Theme status indicator
export function ThemeStatus() {
  const { theme } = useThemeStore();
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Monitor className="w-4 h-4" />
      <span>Current: {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme</span>
    </div>
  );
}

export default ThemeToggle;
