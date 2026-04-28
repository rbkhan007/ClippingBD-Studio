'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import Page from '../page';

export default function CatchAll() {
  const { setCurrentPage } = useAppStore();
  
  useEffect(() => {
    setCurrentPage(window.location.pathname);
  }, [setCurrentPage]);
  
  return <Page />;
}