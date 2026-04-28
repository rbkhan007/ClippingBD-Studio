import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookies } from '@/lib/auth-cookies';

/**
 * POST /api/auth/logout
 * Clear all session cookies and log out the user
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Clear all auth cookies
  clearSessionCookies(response);
  
  return response;
}

/**
 * GET /api/auth/logout
 * Alternative logout via GET request (for direct navigation)
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Clear all auth cookies
  clearSessionCookies(response);
  
  return response;
}
