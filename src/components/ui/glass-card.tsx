'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StarRating } from './star-rating';
import { LucideIcon } from 'lucide-react';

export type GlassCardVariant =
  | 'default'
  | 'premium'
  | 'elevated'
  | 'bordered'
  | 'hover-lift'
  | 'glow'
  | 'gradient-border'
  | 'frosted'
  | 'neon-border'
  | 'service'
  | 'stat'
  | 'pricing'
  | 'testimonial'
  | 'feature';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: GlassCardVariant;
  glowColor?: 'emerald' | 'cyan' | 'blue' | 'purple' | 'custom';
  customGlowColor?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  hoverScale?: number;
  animateOnHover?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<GlassCardVariant, string> = {
  default: 'glass-card',
  premium: 'glass-card-premium',
  elevated: 'glass-card shadow-2xl shadow-black/10 dark:shadow-black/20 dark:shadow-emerald-500/5',
  bordered: 'glass-card border-2',
  'hover-lift': 'glass-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10',
  glow: 'glass-card glow-emerald',
  'gradient-border': 'gradient-border',
  frosted: 'glass-frosted',
  'neon-border': 'glass-neon-border',
  service: 'service-card',
  stat: 'stat-card',
  pricing: 'pricing-card',
  testimonial: 'testimonial-card',
  feature: 'feature-card',
};

const blurStyles: Record<string, string> = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
};

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const roundedStyles: Record<string, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

const glowColors: Record<string, string> = {
  emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
  cyan: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]',
  blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  purple: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
  custom: '',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({
    variant = 'default',
    glowColor = 'emerald',
    customGlowColor,
    blur = 'xl',
    padding = 'lg',
    rounded = '2xl',
    hoverScale,
    animateOnHover = true,
    className,
    children,
    ...props
  }, ref) => {
    const glowStyle = customGlowColor
      ? `hover:shadow-[0_0_30px_${customGlowColor}]`
      : glowColors[glowColor];

    // Variants that don't need padding classes (they have their own)
    const noPaddingVariants = ['service', 'stat', 'pricing', 'testimonial', 'feature', 'neon-border'];

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          variantStyles[variant],
          blurStyles[blur],
          !noPaddingVariants.includes(variant) && paddingStyles[padding],
          roundedStyles[rounded],
          variant === 'hover-lift' && glowStyle,
          'text-foreground',
          className
        )}
        whileHover={animateOnHover && hoverScale ? { scale: hoverScale } : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {variant === 'premium' && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 pointer-events-none" />
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export function GlassCardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mb-4 pb-4 border-b border-slate-200/50 dark:border-white/10', className)}>
      {children}
    </div>
  );
}

export function GlassCardTitle({ className, gradient = false, children }: { className?: string; gradient?: boolean; children: React.ReactNode }) {
  return (
    <h3 className={cn('text-xl font-bold text-foreground', gradient && 'gradient-text', className)}>
      {children}
    </h3>
  );
}

export function GlassCardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn('text-sm text-muted-foreground mt-1', className)}>
      {children}
    </p>
  );
}

export function GlassCardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function GlassCardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10', className)}>
      {children}
    </div>
  );
}

export function GlassCardStats({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  className,
}: {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  className?: string;
}) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <GlassCard variant="hover-lift" padding="lg" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl sm:text-4xl font-bold mt-2 gradient-text">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && trendValue && (
            <p className={cn('text-sm mt-2 flex items-center gap-1', trendColors[trend])}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <motion.div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}

export function GlassCardFeature({
  icon: Icon,
  title,
  description,
  className,
  onClick,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <GlassCard
      variant="hover-lift"
      padding="lg"
      className={cn(onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {Icon && (
        <motion.div
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
      )}
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </GlassCard>
  );
}

export function GlassCardTestimonial({
  quote,
  author,
  role,
  company,
  avatar,
  rating = 5,
  className,
}: {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}) {
  return (
    <GlassCard variant="default" padding="lg" className={className}>
      <div className="mb-4">
        <StarRating rating={rating} size="sm" />
      </div>
      <p className="text-muted-foreground mb-4 italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={author} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold shadow-lg">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{author}</p>
          {(role || company) && (
            <p className="text-sm text-muted-foreground">
              {role}{role && company && ', '}{company}
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// Premium Pricing Card with featured highlight
export function GlassCardPricing({
  name,
  price,
  period,
  description,
  features,
  featured = false,
  ctaText = 'Get Started',
  onCtaClick,
  className,
}: {
  name: string;
  price: string | number;
  period?: string;
  description?: string;
  features: string[];
  featured?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        'pricing-card p-8',
        featured && 'featured',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="text-center mb-6">
        <span className="text-4xl sm:text-5xl font-bold gradient-text">{price}</span>
        {period && <span className="text-muted-foreground">/{period}</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <motion.button
        onClick={onCtaClick}
        className={cn(
          'w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300',
          featured
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30'
            : 'glass-button text-foreground hover:border-emerald-500/30'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {ctaText}
      </motion.button>
    </motion.div>
  );
}

// Service Card with icon and link
export function GlassCardService({
  icon: Icon,
  title,
  description,
  href,
  gradient = 'from-emerald-500 to-teal-600',
  className,
  onClick,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  href?: string;
  gradient?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className={cn('service-card p-6', className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {Icon && (
        <motion.div
          className={cn(
            'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg',
            gradient
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
      )}
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {(href || onClick) && (
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-400">
          Learn more
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}

export default GlassCard;
