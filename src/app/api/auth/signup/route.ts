import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applyRateLimit, getRateLimitHeaders, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { validateSignup } from '@/lib/validations/auth';
import bcrypt from 'bcrypt';

/**
 * POST /api/auth/signup
 * Register a new user
 * 
 * New clients are auto-approved with ACTIVE status - they can login immediately.
 * Only ADMIN/DEVELOPER roles require manual approval.
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
    const validationResult = validateSignup(body);
    if (!validationResult.success) {
      // Get the first validation error for display
      const firstError = validationResult.error.issues[0];
      let errorMessage = 'Validation failed';
      
      // Map common validation errors to user-friendly messages
      if (firstError) {
        const path = firstError.path.join('.');
        const message = firstError.message;
        
        if (path === 'password') {
          if (message.includes('lowercase')) {
            errorMessage = 'Password must contain at least one lowercase letter';
          } else if (message.includes('uppercase')) {
            errorMessage = 'Password must contain at least one uppercase letter';
          } else if (message.includes('number')) {
            errorMessage = 'Password must contain at least one number';
          } else if (message.includes('special')) {
            errorMessage = 'Password must contain at least one special character (!@#$%^&*...)';
          } else {
            errorMessage = message;
          }
        } else if (path === 'confirmPassword' || path === 'confirmpassword') {
          errorMessage = 'Passwords do not match';
        } else if (path === 'terms') {
          errorMessage = 'You must accept the terms and conditions';
        } else {
          errorMessage = message;
        }
      }
      
      return NextResponse.json(
        {
          error: errorMessage,
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password, name, role } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'An account with this email already exists',
          field: 'email',
        },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine user role - allow CLIENT, EDITOR, QA from signup
    // Only CLIENT role is auto-approved
    // EDITOR and QA require manual approval
    const userRole = role || 'CLIENT';
    const userStatus = userRole === 'CLIENT' ? 'ACTIVE' : 'PENDING';

    // Create user in database with ACTIVE status for clients
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: userRole,
        status: userStatus,
        walletBalance: 0,
        currency: 'USD',
        approvedAt: userStatus === 'ACTIVE' ? new Date() : null,
      },
    });

    // Return success - client can login immediately, EDITOR/QA need approval
    const needsApproval = userRole !== 'CLIENT';
    return NextResponse.json({
      success: true,
      message: needsApproval 
        ? 'Your account has been created! You will be notified once approved.' 
        : 'Your account has been created successfully! You can now log in.',
      needsApproval,
      user: userStatus === 'ACTIVE' ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      } : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);

    // Handle Prisma unique constraint error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/signup
 * Check if email is available
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    );
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return NextResponse.json({
      available: !existingUser,
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}
