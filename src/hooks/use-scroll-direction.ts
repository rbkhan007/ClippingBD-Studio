'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
  debounceTime?: number;
}

interface ScrollDirection {
  isScrollingDown: boolean;
  isAtTop: boolean;
  scrollY: number;
}

export function useScrollDirection(options: UseScrollDirectionOptions = {}): ScrollDirection {
  const { threshold = 10, debounceTime = 10 } = options;
  
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>({
    isScrollingDown: false,
    isAtTop: true,
    scrollY: 0,
  });

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const isAtTop = currentScrollY < threshold;
    
    setScrollDirection((prev) => {
      // If at top, always show
      if (isAtTop) {
        return { isScrollingDown: false, isAtTop: true, scrollY: currentScrollY };
      }
      
      // Determine scroll direction
      const isScrollingDown = currentScrollY > prev.scrollY;
      
      return {
        isScrollingDown,
        isAtTop,
        scrollY: currentScrollY,
      };
    });
  }, [threshold]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, debounceTime);
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll, debounceTime]);

  return scrollDirection;
}
