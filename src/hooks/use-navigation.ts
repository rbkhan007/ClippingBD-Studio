import { useCallback } from 'react';
import { useAppStore } from '@/store/app-store';

export function useNavigation() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  const handleNavigate = useCallback((path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
    // Scroll to top immediately and after a delay
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
  }, [setCurrentPage]);

  return { handleNavigate, setCurrentPage };
}

export default useNavigation;