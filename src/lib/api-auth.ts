import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyToken } from '@/lib/auth-cookies';
import type { UserRole } from '@/types/database';

/**
 * Authentication middleware for API routes
 */

export interface AuthResult {
  authorized: boolean;
  userId?: string;
  role?: UserRole;
  error?: NextResponse;
}

/**
 * Get session from request (supports both cookies and Authorization header)
 */
async function getAuthSession(request: NextRequest) {
  // First try to get from cookies
  const cookieSession = await getSession(request);
  if (cookieSession) {
    return cookieSession;
  }

  // Then try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  return null;
}

/**
 * Require authentication for an API route
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const session = await getAuthSession(request);
    
    if (!session || !session.userId) {
      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    return {
      authorized: true,
      userId: session.userId,
      role: session.role as UserRole,
    };
  } catch (error) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid session' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Require specific roles for an API route
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  const authResult = await requireAuth(request);
  
  if (!authResult.authorized) {
    return authResult;
  }

  if (!authResult.role || !allowedRoles.includes(authResult.role)) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Require admin or developer role
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, ['ADMIN', 'DEVELOPER']);
}

/**
 * Require developer role
 */
export async function requireDeveloper(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, ['DEVELOPER']);
}

/**
 * Require client role (or higher for own resources)
 */
export async function requireClient(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER']);
}

/**
 * Require editor role or higher
 */
export async function requireEditor(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, ['EDITOR', 'QA', 'ADMIN', 'DEVELOPER']);
}

/**
 * Require QA role or higher
 */
export async function requireQA(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, ['QA', 'ADMIN', 'DEVELOPER']);
}

/**
 * Check if user owns a resource or is admin
 */
export function canAccessResource(
  authResult: AuthResult,
  resourceUserId: string
): boolean {
  if (!authResult.authorized || !authResult.role) return false;
  
  // Admins and developers can access all resources
  if (['ADMIN', 'DEVELOPER'].includes(authResult.role)) return true;
  
  // Users can access their own resources
  return authResult.userId === resourceUserId;
}

/**
 * Role hierarchy for permission checks
 */
export const roleHierarchy: Record<UserRole, number> = {
  GUEST: 0,
  CLIENT: 1,
  EDITOR: 2,
  QA: 3,
  ADMIN: 4,
  DEVELOPER: 5,
};

/**
 * Check if user has role equal or higher than required
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
