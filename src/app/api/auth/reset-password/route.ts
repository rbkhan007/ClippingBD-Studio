import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { validatePasswordReset } from '@/lib/validations/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = validatePasswordReset(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      let errorMessage = 'Validation failed';
      
      if (firstError) {
        const path = firstError.path.join('.');
        const message = firstError.message;
        
        if (path === 'newPassword' || path === 'password') {
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
        } else if (path === 'token') {
          errorMessage = 'Reset token is required';
        } else {
          errorMessage = message;
        }
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const { token, password: newPassword } = validationResult.data;

    // Find user by reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired reset token. Please request a new password reset.',
      }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}