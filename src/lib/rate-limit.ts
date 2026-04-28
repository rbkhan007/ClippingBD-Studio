import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
  message?: string;
}

export const RATE_LIMIT_CONFIGS = {
  default: { limit: 100, windowMs: 15 * 60 * 1000, keyPrefix: "default", message: "Too many requests" },
  auth: { limit: 5, windowMs: 15 * 60 * 1000, keyPrefix: "auth", message: "Auth limit exceeded" },
  upload: { limit: 20, windowMs: 15 * 60 * 1000, keyPrefix: "upload", message: "Upload limit exceeded" },
  admin: { limit: 60, windowMs: 15 * 60 * 1000, keyPrefix: "admin", message: "Admin API limit exceeded" },
  order: { limit: 30, windowMs: 15 * 60 * 1000, keyPrefix: "order", message: "Order API limit exceeded" },
} as const;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  return "127.0.0.1";
}

export function checkRateLimit(request: NextRequest, config: RateLimitConfig): { success: boolean; limit: number; remaining: number; reset: number; message?: string } {
  const clientIp = getClientIp(request);
  const key = `${config.keyPrefix || "default"}:${clientIp}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { success: true, limit: config.limit, remaining: config.limit - 1, reset: now + config.windowMs };
  }

  if (entry.count >= config.limit) {
    return { success: false, limit: config.limit, remaining: 0, reset: entry.resetTime, message: config.message };
  }

  entry.count += 1;
  return { success: true, limit: config.limit, remaining: config.limit - entry.count, reset: entry.resetTime };
}

export function applyRateLimit(request: NextRequest, config: RateLimitConfig): NextResponse | null {
  const result = checkRateLimit(request, config);
  if (!result.success) {
    return NextResponse.json(
      { error: result.message || "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString() } }
    );
  }
  return null;
}

export function getRateLimitHeaders(request: NextRequest, config: RateLimitConfig): Record<string, string> {
  const result = checkRateLimit(request, config);
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}

export function resetRateLimit(request: NextRequest, config: RateLimitConfig): void {
  const clientIp = getClientIp(request);
  const key = `${config.keyPrefix || "default"}:${clientIp}`;
  rateLimitStore.delete(key);
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) rateLimitStore.delete(key);
    }
  }, 5 * 60 * 1000);
}
