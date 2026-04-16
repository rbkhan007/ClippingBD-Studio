'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showValue = false,
  className 
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star 
          key={`full-${i}`} 
          className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")} 
        />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className={cn(sizeClasses[size], "text-muted-foreground/30")} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star 
          key={`empty-${i}`} 
          className={cn(sizeClasses[size], "text-muted-foreground/30")} 
        />
      ))}
      
      {/* Show numeric value */}
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Interactive star rating for forms
interface InteractiveStarRatingProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InteractiveStarRating({
  value,
  onChange,
  maxRating = 5,
  size = 'md',
  className
}: InteractiveStarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const displayValue = hoverValue !== null ? hoverValue : value;
  const fullStars = Math.floor(displayValue);
  const hasHalfStar = displayValue % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const handleClick = (newValue: number) => {
    onChange(newValue);
  };

  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isFull = starValue <= fullStars;
        const isHalf = starValue === fullStars + 1 && hasHalfStar;
        
        return (
          <button
            key={i}
            type="button"
            className="relative focus:outline-none transition-transform hover:scale-110"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => setHoverValue(starValue)}
          >
            <Star 
              className={cn(
                sizeClasses[size],
                (isFull || isHalf) 
                  ? "fill-amber-400 text-amber-400" 
                  : "text-muted-foreground/30 hover:text-amber-300"
              )} 
            />
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;