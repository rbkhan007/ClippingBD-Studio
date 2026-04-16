import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting configuration options
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional key prefix for namespacing */
  keyPrefix?: string;
  /** Custom message when rate limit is exceeded */
  message?: string;
}

/**
 * Rate limit entry stored in memory
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limiting
 * Uses Map for O(1) lookups
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically (every 5 minutes)
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMIT_CONFIGS = {
  /** Default: 100 requests per 15 minutes */
  default: {
    limit: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'default',
    message: 'Too many requests, please try again later.',
  },
  /** Stricter limit for auth routes: 5 requests per 15 minutes */
  auth: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'auth',
    message: 'Too many authentication attempts, please try again later.',
  },
  /** Rate limit for file uploads: 20 requests per 15 minutes */
  upload: {
    limit: 20,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'upload',
    message: 'Too many upload requests, please try again later.',
  },
  /** Rate limit for asset access: 200 requests per 15 minutes */
  asset: {
    limit: 200,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'asset',
    message: 'Too many asset requests, please try again later.',
  },
} as const;

/**
 * Extract client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }

  // Fallback for development/local environments
  return '127.0.0.1';
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  message?: string;
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetTime,
      message: config.message,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Create a rate-limited API handler wrapper
 * Returns null if rate limit is passed, or a NextResponse if rate limit is exceeded
 */
export function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
): NextResponse | null {
  const clientIp = getClientIp(request);
  const key = `${config.keyPrefix || 'default'}:${clientIp}`;

  const result = checkRateLimit(key, config);

  // Add rate limit headers to response
  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    'X-RateLimit-Reset-After': Math.max(0, Math.ceil((result.reset - Date.now()) / 1000)).toString(),
  };

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.message || 'Too many requests',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Return null to indicate rate limit passed
  // Caller should merge headers into their response
  return null;
}

/**
 * Get rate limit headers for successful responses
 * Use this to add rate limit info to successful responses
 */
export function getRateLimitHeaders(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
): Record<string, string> {
  const clientIp = getClientIp(request);
  const key = `${config.keyPrefix || 'default'}:${clientIp}`;

  const entry = rateLimitStore.get(key);

  if (!entry) {
    return {
      'X-RateLimit-Limit': config.limit.toString(),
      'X-RateLimit-Remaining': (config.limit - 1).toString(),
      'X-RateLimit-Reset': (Date.now() + config.windowMs).toString(),
    };
  }

  return {
    'X-RateLimit-Limit': config.limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, config.limit - entry.count).toString(),
    'X-RateLimit-Reset': entry.resetTime.toString(),
  };
}

/**
 * Higher-order function to wrap an API handler with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
) {
  return async (request: NextRequest, context?: unknown): Promise<NextResponse> => {
    const rateLimitResponse = applyRateLimit(request, config);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const response = await handler(request, context);

    // Add rate limit headers to response
    const headers = getRateLimitHeaders(request, config);
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }

    return response;
  };
}

/**
 * Reset rate limit for a specific key (useful for testing or admin actions)
 */
export function resetRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
): void {
  const clientIp = getClientIp(request);
  const key = `${config.keyPrefix || 'default'}:${clientIp}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
): { count: number; resetTime: number } | null {
  const clientIp = getClientIp(request);
  const key = `${config.keyPrefix || 'default'}:${clientIp}`;

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < Date.now()) {
    return null;
  }

  return {
    count: entry.count,
    resetTime: entry.resetTime,
  };
}
