/**
 * Database Configuration
 * 
 * Supports:
 * - SQLite (default) - Local development
 * - Supabase (PostgreSQL) - Production
 * 
 * Switch databases by changing DATABASE_URL in .env file
 * 
 * SQLite: DATABASE_URL="file:./db/custom.db"
 * Supabase: DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
 */

// Database type detection
export function getDatabaseType(): 'sqlite' | 'postgresql' {
  const dbUrl = process.env.DATABASE_URL || '';
  return dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') 
    ? 'postgresql' 
    : 'sqlite';
}

// Check if using SQLite
export function isSQLite(): boolean {
  return getDatabaseType() === 'sqlite';
}

// Check if using PostgreSQL/Supabase
export function isPostgreSQL(): boolean {
  return getDatabaseType() === 'postgresql';
}

// Check if Supabase is configured (has both DB URL and project credentials)
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Get database configuration info
export function getDatabaseInfo() {
  return {
    type: getDatabaseType(),
    isSQLite: isSQLite(),
    isPostgreSQL: isPostgreSQL(),
    isSupabaseConfigured: isSupabaseConfigured(),
    databaseUrl: process.env.DATABASE_URL ? '(configured)' : '(not set)',
  };
}

// Database-specific query helpers
export const dbHelpers = {
  // For SQLite, JSON fields are stored as strings
  // For PostgreSQL, JSON fields can be native JSONB
  parseJSON: <T>(value: string | null): T | null => {
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
  
  stringifyJSON: (value: unknown): string => {
    return JSON.stringify(value);
  },
  
  // Date handling
  formatDate: (date: Date | string | null): string | null => {
    if (!date) return null;
    return new Date(date).toISOString();
  },
  
  parseDate: (date: string | null): Date | null => {
    if (!date) return null;
    return new Date(date);
  },
};

// Log database configuration on startup (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('[Database Config]', getDatabaseInfo());
}
