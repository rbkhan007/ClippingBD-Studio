'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSettings } from '@/store/app-settings';
import { isRealtimeEnabled } from '@/lib/supabase';

export function RealtimeIndicator() {
  const [isConnected, setIsConnected] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const { isLive } = useAppSettings();

  useEffect(() => {
    const realtimeEnabled = isRealtimeEnabled();
    setIsConnected(realtimeEnabled && isLive);
    setShowIndicator(true);

    // Auto-hide after 3 seconds if not realtime (faster feedback)
    if (!realtimeEnabled) {
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLive]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-[100]"
        >
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border
            ${isConnected 
              ? 'border-emerald-500/50 bg-emerald-500/10' 
              : 'border-amber-500/50 bg-amber-500/10'
            }
          `}>
            {isConnected ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wifi className="w-4 h-4 text-emerald-400" />
                </motion.div>
                <span className="text-xs text-emerald-400 font-medium">Live</span>
                <motion.div 
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">SQLite Mode</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConnectionStatus() {
  const { isLive } = useAppSettings();
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    if (isLive) {
      setLastSync(new Date());
    }
  }, [isLive]);

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    const diff = Date.now() - lastSync.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className={`
        w-2 h-2 rounded-full
        ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}
      `} />
      <span>
        {isLive ? 'Connected' : 'Offline'} 
        {lastSync && ` • Last sync: ${formatLastSync()}`}
      </span>
    </div>
  );
}
