import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create the client if both URL and key are provided
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey 
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Check if Supabase realtime is enabled
export function isRealtimeEnabled(): boolean {
  return isSupabaseConfigured();
}
