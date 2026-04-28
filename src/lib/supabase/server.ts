/**
 * Supabase Server Client
 * Server-side Supabase client with cookie-based session handling and admin support
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Check if Supabase is properly configured (server-side)
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
 * Check if service role key is available
 */
export function hasServiceRoleKey(): boolean {
  return !!(
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== ''
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
    hasServiceKey: hasServiceRoleKey(),
  }
}

/**
 * Supabase server client type
 */
type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>

/**
 * Create a server-side Supabase client with cookie handling
 * Returns null if Supabase is not configured
 */
export async function createClient(): Promise<SupabaseServerClient | null> {
  if (!isSupabaseConfigured()) {
    console.log('[Supabase Server] Not configured, using Prisma fallback')
    return null
  }

  try {
    const cookieStore = await cookies()

    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('[Supabase Server] Failed to create client:', error)
    return null
  }
}

/**
 * Create an admin client with service role privileges
 * Use this for elevated operations that bypass RLS
 * Returns null if service role key is not available
 */
export async function createAdminClient(): Promise<SupabaseServerClient | null> {
  if (!isSupabaseConfigured()) {
    console.log('[Supabase Admin] Not configured, using Prisma fallback')
    return null
  }

  if (!hasServiceRoleKey()) {
    console.warn('[Supabase Admin] Service role key not available')
    return null
  }

  try {
    const cookieStore = await cookies()

    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  } catch (error) {
    console.error('[Supabase Admin] Failed to create admin client:', error)
    return null
  }
}

/**
 * Get the Supabase client or throw an error
 * Use this when you're sure Supabase is configured
 */
export async function requireSupabaseClient(): Promise<SupabaseServerClient> {
  const supabase = await createClient()
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return supabase
}

/**
 * Get the Supabase admin client or throw an error
 * Use this when you're sure Supabase and service role are configured
 */
export async function requireAdminClient(): Promise<SupabaseServerClient> {
  const supabase = await createAdminClient()
  if (!supabase) {
    throw new Error('Supabase admin client is not available. Please set SUPABASE_SERVICE_ROLE_KEY')
  }
  return supabase
}

/**
 * Execute a Supabase operation with automatic fallback to Prisma
 * This is a helper for operations that need graceful degradation
 */
export async function withSupabaseOrFallback<T>(
  operation: (supabase: SupabaseServerClient) => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  const supabase = await createClient()
  
  if (supabase) {
    try {
      return await operation(supabase)
    } catch (error) {
      console.error('[Supabase] Operation failed, falling back to Prisma:', error)
      return fallback()
    }
  }
  
  return fallback()
}

// Export types
export type { Database }
