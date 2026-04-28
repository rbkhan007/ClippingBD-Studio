import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint for load balancers and monitoring
 * Returns system status without authentication
 */
export async function GET() {
  try {
    // Check database connectivity
    const { db } = await import('@/lib/db');
    const dbResult = await db.$queryRaw`SELECT 1 as ok`;
    
    // Check environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    }, { status: 503 });
  }
}
