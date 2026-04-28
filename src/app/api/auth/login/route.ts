import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applyRateLimit, getRateLimitHeaders, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { validateLogin, type LoginInput } from '@/lib/validations/auth';
import {
  generateToken,
  generateRefreshToken,
  setSessionCookie,
  setRefreshTokenCookie,
} from '@/lib/auth-cookies';
import bcrypt from 'bcrypt';

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting for auth routes
  const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_CONFIGS.auth);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = validateLogin(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = validationResult.data as LoginInput;

    // Find user in database
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is pending approval
    if (user.status === 'PENDING') {
      return NextResponse.json(
        { 
          error: 'Your account is pending approval. Please wait for an administrator to approve your account.',
          status: 'PENDING',
        },
        { status: 403 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      const statusMessages: Record<string, string> = {
        'SUSPENDED': 'Your account has been suspended. Please contact support.',
        'BANNED': 'Your account has been banned. Please contact support.',
      };
      return NextResponse.json(
        { error: statusMessages[user.status] || 'Account is not active. Please contact support.' },
        { status: 403 }
      );
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const token = await generateToken({
      userId: user.id,
      role: user.role || 'CLIENT',
      email: user.email,
    });

    const refreshToken = await generateRefreshToken(user.id);

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        walletBalance: user.walletBalance,
        currency: user.currency,
      },
      token,
    });

    // Set secure HttpOnly cookies
    setSessionCookie(response, token, { rememberMe });
    setRefreshTokenCookie(response, refreshToken);

    // Add rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(request, RATE_LIMIT_CONFIGS.auth);
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * Check authentication status
 */
export async function GET(request: NextRequest) {
  try {
    const { getSession } = await import('@/lib/auth-cookies');

    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        walletBalance: true,
        currency: true,
        company: true,
        country: true,
        phone: true,
        timezone: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { authenticated: false, error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        walletBalance: user.walletBalance,
        currency: user.currency,
        company: user.company,
        country: user.country,
        phone: user.phone,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Failed to check authentication' },
      { status: 500 }
    );
  }
}
