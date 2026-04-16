/**
 * Supabase Browser Client
 * Browser-safe Supabase client with configuration detection and fallback support
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return !!(
    url &&
    key &&
    url !== 'https://your-project.supabase.co' &&
    url !== '' &&
    key !== '' &&
    url.startsWith('http')
  )
}

/**
 * Get Supabase configuration status
 */
export function getSupabaseConfig() {
  return {
    isConfigured: isSupabaseConfigured(),
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

/**
 * Supabase client type
 */
type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>

/**
 * Singleton instance for client-side usage
 */
let client: SupabaseClient | null = null

/**
 * Create a browser Supabase client
 * Returns null if Supabase is not configured
 */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    console.log('[Supabase] Not configured, using Prisma fallback')
    return null
  }

  try {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (error) {
    console.error('[Supabase] Failed to create browser client:', error)
    return null
  }
}

/**
 * Get or create the Supabase client singleton
 * Returns null if Supabase is not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!client) {
    client = createBrowserSupabaseClient()
  }

  return client
}

/**
 * Get the Supabase client or throw an error
 * Use this when you're sure Supabase is configured
 */
export function requireSupabaseClient(): SupabaseClient {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return supabase
}

/**
 * Check if Supabase realtime is enabled (same as isSupabaseConfigured for now)
 */
export function isRealtimeEnabled(): boolean {
  return isSupabaseConfigured()
}

/**
 * Reset the client (useful for testing or reconfiguration)
 */
export function resetSupabaseClient(): void {
  client = null
}

// Export types
export type { Database }
