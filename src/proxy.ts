/*turbopackIgnore: true*/
import type { NextMiddleware } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types/database'
import { verifyToken } from '@/lib/auth-cookies'
import { checkRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

// Environment variables - loaded at runtime
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',')

// Route protection configuration
const publicRoutes = [
  '/',
  '/services',
  '/services/clipping-path',
  '/services/image',
  '/services/video',
  '/services/ai',
  '/services/web',
  '/portfolio',
  '/studio',
  '/team',
  '/contact',
  '/privacy',
  '/terms',
  '/support',
  '/auth',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/contact',
  '/api/reviews',
  '/api/services',
  '/api/portfolio',
  '/api/team',
  '/api/statistics',
  '/api/static-data',
  '/api/cms/data',
  '/api/cms/hero',
  '/api/cms/statistics',
  '/api/cms/features',
  '/api/cms/services',
  '/api/cms/testimonials',
  '/api/cms/team',
  '/api/cms/partners',
  '/api/cms/contact-info',
  '/api/cms/faqs',
  '/api/cms/pages',
  '/api/payments/paypal',
  '/manifest.webmanifest',
  '/icon',
  '/apple-icon',
]

const protectedRoutes: Record<string, UserRole[]> = {
  '/pricing': ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'],
  '/dashboard': ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'],
  '/brief': ['CLIENT', 'ADMIN', 'DEVELOPER'],
  '/orders': ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'],
  '/projects': ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'],
  '/billing': ['CLIENT', 'ADMIN', 'DEVELOPER'],
  '/support': ['CLIENT', 'ADMIN', 'DEVELOPER'],
  '/assets': ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'],
  '/profile': ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'],
  '/messages': ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'],
  '/editor': ['EDITOR', 'ADMIN', 'DEVELOPER'],
  '/qa': ['QA', 'ADMIN', 'DEVELOPER'],
  '/admin': ['ADMIN', 'DEVELOPER'],
  '/dev': ['DEVELOPER'],
  '/users': ['ADMIN', 'DEVELOPER'],
  '/settings': ['ADMIN', 'DEVELOPER'],
  '/cms': ['ADMIN', 'DEVELOPER'],
  '/statistics': ['ADMIN', 'DEVELOPER'],
  '/system': ['DEVELOPER'],
  '/logs': ['DEVELOPER'],
}

const roleHierarchy: Record<UserRole, number> = {
  GUEST: 0,
  CLIENT: 1,
  EDITOR: 2,
  QA: 3,
  ADMIN: 4,
  DEVELOPER: 5,
}

function canAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  if (requiredRoles.length === 0) return true
  const userLevel = roleHierarchy[userRole]
  return requiredRoles.some(role => roleHierarchy[role] <= userLevel)
}

async function getUserFromCookie(request: NextRequest): Promise<{ id: string; role: UserRole } | null> {
  const authCookie = request.cookies.get('auth_session')
  if (!authCookie) return null

  try {
    const session = await verifyToken(authCookie.value)
    if (!session) return null
    return { id: session.userId, role: session.role as UserRole }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => 
    o === origin || o === '*'
  ) ? origin : ALLOWED_ORIGINS[0] || '*'

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const user = await getUserFromCookie(request)

  const response = NextResponse.next()

  const corsHeaders = getCorsHeaders(request.headers.get('origin'))
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  if (pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers: response.headers })
    }

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  }

  // Require authentication for real-time and sensitive APIs
  const authRequiredAPIs = [
    '/api/notifications',
    '/api/chat/',
    '/api/orders',
    '/api/tasks',
    '/api/tickets',
    '/api/transactions',
    '/api/upload',
    '/api/users/profile',
    '/api/settings',
  ];
  
  const isAuthRequiredAPI = authRequiredAPIs.some(api => pathname.startsWith(api));
  if (isAuthRequiredAPI && !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401, headers: response.headers }
    );
  }

  // Rate limiting for sensitive admin API routes
  if (pathname.startsWith('/api/admin/') && request.method !== 'GET') {
    const rateLimitResult = checkRateLimit(request, RATE_LIMIT_CONFIGS.admin)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message || 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
  }

  if (pathname.startsWith('/api/proxy/asset/')) {
    const publicBuckets = ['public']
    const bucketMatch = pathname.match(/\/api\/proxy\/asset\/([^/]+)\//)
    const bucket = bucketMatch ? bucketMatch[1] : null
    
    if (!bucket || !publicBuckets.includes(bucket)) {
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401, headers: response.headers }
        )
      }
    }
  }

  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return response
  }

  const requiresAuth = Object.keys(protectedRoutes).some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (requiresAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url, { headers: response.headers })
  }

  if (user) {
    const matchingRoute = Object.keys(protectedRoutes).find(route =>
      pathname === route || pathname.startsWith(route + '/')
    )

    if (matchingRoute) {
      const requiredRoles = protectedRoutes[matchingRoute]

      if (!canAccess(user.role, requiredRoles)) {
        const url = request.nextUrl.clone()

        switch (user.role) {
          case 'CLIENT':
            url.pathname = '/dashboard'
            break
          case 'EDITOR':
            url.pathname = '/editor/board'
            break
          case 'QA':
            url.pathname = '/qa/pending'
            break
          case 'ADMIN':
            url.pathname = '/admin/analytics'
            break
          case 'DEVELOPER':
            url.pathname = '/dev/console'
            break
          default:
            url.pathname = '/dashboard'
        }

        return NextResponse.redirect(url, { headers: response.headers })
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}