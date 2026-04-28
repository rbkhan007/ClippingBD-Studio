'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-8 h-8', md: 'w-9 h-9', lg: 'w-10 h-10' };
const iconSizes = { sm: 'w-4 h-4', md: 'w-4 h-4', lg: 'w-5 h-5' };

export function ThemeToggle({ variant = 'icon', size = 'md', className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const currentTheme = resolvedTheme || 'dark';

  const handleToggle = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

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
        aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {currentTheme === 'dark' ? (
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
          onClick={() => setTheme('light')}
          className={cn('px-3 py-1.5 rounded-md text-sm transition-colors',
            currentTheme === 'light' ? 'bg-emerald-600 text-white' : 'hover:bg-muted')}
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={cn('px-3 py-1.5 rounded-md text-sm transition-colors',
            currentTheme === 'dark' ? 'bg-emerald-600 text-white' : 'hover:bg-muted')}
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
}

export default ThemeToggle;
