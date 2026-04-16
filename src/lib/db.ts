/**
 * Database Client
 * 
 * Provides a singleton Prisma client instance with:
 * - Connection pooling (PostgreSQL)
 * - Query logging (development)
 * - Automatic reconnection
 * - Graceful shutdown
 */

import { Prisma, PrismaClient } from '@prisma/client';

// Global type for Prisma client singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma client options - using explicit type casting
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] as Prisma.LogLevel[]
    : ['error'] as Prisma.LogLevel[],
};

// Create Prisma client singleton
export const db = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

// Store in global for hot reload (development)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Graceful shutdown handler
const gracefulShutdown = async () => {
  try {
    await db.$disconnect();
    console.log('[Database] Disconnected successfully');
  } catch (error) {
    console.error('[Database] Error during disconnect:', error);
  }
};

// Register shutdown handlers
process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);