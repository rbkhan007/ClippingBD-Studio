'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface CmsSettings {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  footerText: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface AppSettingsState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // CMS Settings
  cmsSettings: CmsSettings | null;
  isLive: boolean; // Realtime connection status
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setCmsSettings: (settings: CmsSettings) => void;
  setIsLive: (live: boolean) => void;
  applyThemeColors: () => void;
}

export const useAppSettings = create<AppSettingsState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      primaryColor: '#00d4ff',
      secondaryColor: '#22d3ee',
      accentColor: '#f97316',
      cmsSettings: null,
      isLive: false,

      setTheme: (theme) => {
        set({ theme });
        get().applyThemeColors();
      },

      setPrimaryColor: (color) => {
        set({ primaryColor: color });
        get().applyThemeColors();
      },

      setSecondaryColor: (color) => {
        set({ secondaryColor: color });
        get().applyThemeColors();
      },

      setAccentColor: (color) => {
        set({ accentColor: color });
        get().applyThemeColors();
      },

      setCmsSettings: (settings) => {
        set({ cmsSettings: settings });
        if (settings.primaryColor) set({ primaryColor: settings.primaryColor });
        if (settings.secondaryColor) set({ secondaryColor: settings.secondaryColor });
        if (settings.accentColor) set({ accentColor: settings.accentColor });
        get().applyThemeColors();
      },

      setIsLive: (live) => set({ isLive: live }),

      applyThemeColors: () => {
        const { primaryColor, secondaryColor, accentColor } = get();
        
        // Apply CSS variables for dynamic theming
        const root = document.documentElement;
        root.style.setProperty('--primary-neon', primaryColor);
        root.style.setProperty('--secondary-neon', secondaryColor);
        root.style.setProperty('--accent-neon', accentColor);
        
        // Generate lighter/darker variants
        root.style.setProperty('--primary-light', adjustColor(primaryColor, 30));
        root.style.setProperty('--primary-dark', adjustColor(primaryColor, -30));
        root.style.setProperty('--accent-light', adjustColor(accentColor, 30));
        root.style.setProperty('--accent-dark', adjustColor(accentColor, -30));
      },
    }),
    {
      name: 'app-settings',
      partialize: (state) => ({
        theme: state.theme,
        primaryColor: state.primaryColor,
        secondaryColor: state.secondaryColor,
        accentColor: state.accentColor,
      }),
    }
  )
);

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// Hook to initialize settings from CMS
export function useInitializeCmsSettings() {
  const setCmsSettings = useAppSettings((state) => state.setCmsSettings);
  const applyThemeColors = useAppSettings((state) => state.applyThemeColors);
  const setIsLive = useAppSettings((state) => state.setIsLive);

  const initialize = async () => {
    try {
      const res = await fetch('/api/cms/settings');
      const data = await res.json();
      
      if (data.success && data.data) {
        setCmsSettings(data.data);
        setIsLive(true);
      } else {
        applyThemeColors();
      }
    } catch (error) {
      console.error('Error fetching CMS settings:', error);
      applyThemeColors();
    }
  };

  return initialize;
}
