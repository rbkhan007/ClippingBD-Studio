import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';

export function useScrollToTop() {
  const { setCurrentPage } = useAppStore();

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  const handleNavigation = useCallback((path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 10);
  }, [setCurrentPage]);

  return { scrollToTop, handleNavigation };
}

export default useScrollToTop;