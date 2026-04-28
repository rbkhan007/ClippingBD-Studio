import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Session token payload
 */
export interface SessionPayload {
  userId: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Cookie configuration
 */
const COOKIE_CONFIG = {
  name: 'auth_session',
  refreshTokenName: 'auth_refresh_token',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  refreshMaxAge: 60 * 60 * 24 * 30, // 30 days
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * JWT secret - in production, use environment variable
 * DO NOT use the default in production - set JWT_SECRET or NEXTAUTH_SECRET
 */
function getJwtSecret(): string {
  const defaultSecret = 'clippingbd-studio-default-secret-change-in-production';
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || defaultSecret;

  // In production, enforce use of custom secret
  if (process.env.NODE_ENV === 'production' && secret === defaultSecret) {
    throw new Error('JWT_SECRET must be set in production environment');
  }

  return secret;
}

/**
 * Base64URL encode
 */
function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64URL decode
 */
function base64UrlDecode(data: string): string {
  let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Create a simple signature using HMAC-SHA256
 */
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return base64UrlEncode(Buffer.from(signature).toString('base64'));
}

/**
 * Verify a signature
 */
async function verifySignature(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await createSignature(data, secret);
  return signature === expectedSignature;
}

/**
 * Generate a JWT-like token
 */
export async function generateToken(payload: Omit<SessionPayload, 'iat' | 'exp'>, expiresInMs?: number): Promise<string> {
  const now = Date.now();
  const exp = now + (expiresInMs || COOKIE_CONFIG.maxAge * 1000);

  const tokenPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadEncoded = base64UrlEncode(JSON.stringify(tokenPayload));
  const dataToSign = `${header}.${payloadEncoded}`;
  const signature = await createSignature(dataToSign, getJwtSecret());

  return `${dataToSign}.${signature}`;
}

/**
 * Verify and decode a JWT-like token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signature] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;

    // Verify signature
    const isValid = await verifySignature(dataToSign, signature, getJwtSecret());
    if (!isValid) {
      return null;
    }

    // Decode payload
    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    // Check expiration
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Generate a refresh token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const randomPart = base64UrlEncode(Buffer.from(randomBytes).toString('base64'));

  const timestamp = Date.now().toString(36);
  const payload = base64UrlEncode(JSON.stringify({ userId, timestamp }));

  const signature = await createSignature(`${payload}.${randomPart}`, getJwtSecret());

  return `${payload}.${randomPart}.${signature}`;
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [payloadB64, randomPart, signature] = parts;
    const dataToSign = `${payloadB64}.${randomPart}`;

    const isValid = await verifySignature(dataToSign, signature, getJwtSecret());
    if (!isValid) {
      return null;
    }

    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson);

    return { userId: payload.userId };
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(
  response: NextResponse,
  token: string,
  options?: { rememberMe?: boolean }
): void {
  const maxAge = options?.rememberMe ? COOKIE_CONFIG.maxAge : 60 * 60 * 24; // 1 day or 7 days

  response.cookies.set(COOKIE_CONFIG.name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: COOKIE_CONFIG.sameSite,
    maxAge,
    path: COOKIE_CONFIG.path,
  });
}

/**
 * Set refresh token cookie on response
 */
export function setRefreshTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_CONFIG.refreshTokenName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: COOKIE_CONFIG.sameSite,
    maxAge: COOKIE_CONFIG.refreshMaxAge,
    path: COOKIE_CONFIG.path,
  });
}

/**
 * Clear session cookies
 */
export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(COOKIE_CONFIG.name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: COOKIE_CONFIG.sameSite,
    maxAge: 0,
    path: COOKIE_CONFIG.path,
  });

  response.cookies.set(COOKIE_CONFIG.refreshTokenName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: COOKIE_CONFIG.sameSite,
    maxAge: 0,
    path: COOKIE_CONFIG.path,
  });
}

/**
 * Get session from request
 */
export async function getSession(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_CONFIG.name)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Get refresh token from request
 */
export function getRefreshToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_CONFIG.refreshTokenName)?.value || null;
}

/**
 * Get token from cookies
 */
export function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_CONFIG.name)?.value || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const session = await getSession(request);
  return session !== null;
}

/**
 * Check if user has required role
 */
export async function hasRole(request: NextRequest, requiredRoles: string[]): Promise<boolean> {
  const session = await getSession(request);
  if (!session) {
    return false;
  }
  return requiredRoles.includes(session.role);
}

/**
 * Refresh session with new token
 */
export async function refreshSession(request: NextRequest): Promise<NextResponse | null> {
  const refreshToken = getRefreshToken(request);
  if (!refreshToken) {
    return null;
  }

  const refreshData = await verifyRefreshToken(refreshToken);
  if (!refreshData) {
    return null;
  }

  // Get user from database
  const user = await db.user.findUnique({
    where: { id: refreshData.userId },
  });

  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  // Generate new tokens
  const newToken = await generateToken({
    userId: user.id,
    role: user.role || 'CLIENT',
    email: user.email,
  });

  const newRefreshToken = await generateRefreshToken(user.id);

  // Create response with new tokens
  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
  });

  setSessionCookie(response, newToken);
  setRefreshTokenCookie(response, newRefreshToken);

  return response;
}

/**
 * Middleware helper to get current user
 */
export async function getCurrentUser(request: NextRequest): Promise<{
  id: string;
  email: string;
  name: string | null;
  role: string;
} | null> {
  const session = await getSession(request);
  if (!session) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'CLIENT',
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}
