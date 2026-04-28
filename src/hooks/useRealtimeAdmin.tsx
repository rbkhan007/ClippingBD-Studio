'use client';

import { useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface RealtimeConfig {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  filter?: string;
}

export function useRealtimeAdmin(configs: RealtimeConfig[]) {
  const subscriptionsRef = useRef<any[]>([]);

  const subscribe = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) return;

    for (const config of configs) {
      const channelName = `admin-${config.table}-${Date.now()}`;
      
      const channel = supabase.channel(channelName);

      const subscription = channel
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: config.table 
        }, (payload) => {
          console.log(`[Realtime] New ${config.table}:`, payload);
          config.onInsert?.(payload.new);
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: config.table 
        }, (payload) => {
          console.log(`[Realtime] Updated ${config.table}:`, payload);
          config.onUpdate?.(payload.new);
        })
        .on('postgres_changes', { 
          event: 'DELETE', 
          schema: 'public', 
          table: config.table 
        }, (payload) => {
          console.log(`[Realtime] Deleted ${config.table}:`, payload);
          config.onDelete?.(payload.old);
        })
        .subscribe();

      subscriptionsRef.current.push(subscription);
    }
  }, [configs]);

  const unsubscribe = useCallback(() => {
    subscriptionsRef.current.forEach((sub) => {
      if (supabase) {
        supabase.removeChannel(sub);
      }
    });
    subscriptionsRef.current = [];
  }, []);

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, [subscribe, unsubscribe]);

  return { subscriptions: subscriptionsRef.current };
}

export function useRealtimeTable(table: string, onChange?: (payload: any) => void) {
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
      }, (payload) => {
        console.log(`[Realtime ${table}]`, payload);
        onChange?.(payload);
      })
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, onChange]);
}

export function RealtimeStatus() {
  const isConfigured = isSupabaseConfigured();
  
  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2 text-amber-500 text-xs">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Realtime disabled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-emerald-500 text-xs">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>Live sync active</span>
    </div>
  );
}