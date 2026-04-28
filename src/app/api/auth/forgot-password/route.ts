import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent to your email',
      });
    }

    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + 3600000);

    // Store reset token in database (implementation would go here)
    // console.log('Password reset requested') - Removed for security

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent to your email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}