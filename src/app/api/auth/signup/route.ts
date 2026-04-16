import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applyRateLimit, getRateLimitHeaders, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { validateSignup } from '@/lib/validations/auth';
import bcrypt from 'bcrypt';

/**
 * POST /api/auth/signup
 * Register a new user
 * 
 * New users are created with status "PENDING" and must be approved
 * by an Admin or Developer before they can log in.
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

    const { email, password, name } = validationResult.data;

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

    // Determine user role - new signups are always CLIENT
    // Admin/Developer can change role after approval
    const userRole = 'CLIENT';

    // Create user in database with PENDING status
    // User must be approved by Admin/Developer before they can log in
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: userRole,
        status: 'PENDING', // Requires admin approval
        walletBalance: 0,
        currency: 'USD',
      },
    });

    // Create notification for admins about new pending user
    const admins = await db.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'DEVELOPER' },
        ],
        status: 'ACTIVE',
      },
    });

    // Notify all admins about new user pending approval
    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'SYSTEM',
          title: 'New User Registration',
          message: `New user "${name}" (${email}) is pending approval.`,
          link: '/admin/users?status=PENDING',
        })),
      });
    }

    // Return success - but don't auto-login since user needs approval
    return NextResponse.json({
      success: true,
      message: 'Your account has been created and is pending approval. You will receive an email once an administrator approves your account.',
      requiresApproval: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
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
