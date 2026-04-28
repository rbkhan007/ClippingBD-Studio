'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme-store';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch' | 'dropdown' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizes = { sm: 'w-8 h-8', md: 'w-9 h-9', lg: 'w-10 h-10' };
const iconSizes = { sm: 'w-4 h-4', md: 'w-4 h-4', lg: 'w-5 h-5' };

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem('clippingbd-theme', theme);
}

function getStoredTheme(): string {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem('clippingbd-theme') || 'dark';
}

export function ThemeToggle({
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme() as 'light' | 'dark';
    setCurrentTheme(stored);
    applyTheme(stored);
  }, []);

  const handleToggle = useCallback(() => {
    const newTheme: 'light' | 'dark' = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  }, [currentTheme, setTheme]);

  const actualTheme = mounted ? currentTheme : 'dark';

  if (!mounted) {
    return <div className={cn('rounded-full bg-muted/30 animate-pulse', sizes[size])} />;
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          'rounded-full flex items-center justify-center cursor-pointer',
          'bg-background/50 dark:bg-white/5 border border-border',
          'hover:bg-accent transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
          sizes[size],
          className
        )}
        aria-label={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {actualTheme === 'dark' ? (
          <Sun className={cn('text-amber-500', iconSizes[size])} />
        ) : (
          <Moon className={cn('text-slate-600', iconSizes[size])} />
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border', className)}>
        <button
          onClick={() => { applyTheme('light'); setCurrentTheme('light'); setTheme('light'); }}
          className={cn('px-3 py-1.5 rounded-md text-sm transition-colors',
            actualTheme === 'light' ? 'bg-emerald-600 text-white' : 'hover:bg-muted')}
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => { applyTheme('dark'); setCurrentTheme('dark'); setTheme('dark'); }}
          className={cn('px-3 py-1.5 rounded-md text-sm transition-colors',
            actualTheme === 'dark' ? 'bg-emerald-600 text-white' : 'hover:bg-muted')}
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
}

export default ThemeToggle;
