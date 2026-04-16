import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { applyRateLimit, getRateLimitHeaders, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { getSession, getCurrentUser } from '@/lib/auth-cookies';
import { db } from '@/lib/db';
import { VALID_BUCKETS } from '@/lib/validations/upload';

// Storage path
const STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || /*turbopackIgnore: true*/ './uploads';

// Public buckets that don't require authentication
const PUBLIC_BUCKETS = ['public'];

// Time-to-live for signed URLs (in seconds)
const SIGNED_URL_TTL = 3600; // 1 hour

/**
 * Generate a signed URL token
 */
async function generateSignedUrlToken(
  bucket: string,
  filePath: string,
  userId: string,
  expiresIn: number = SIGNED_URL_TTL
): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  const payload = `${bucket}:${filePath}:${userId}:${expires}`;

  const encoder = new TextEncoder();
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'clippingbd-studio-default-secret';
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureB64 = Buffer.from(signature).toString('base64url');

  return `${expires}:${signatureB64}`;
}

/**
 * Verify a signed URL token
 */
async function verifySignedUrlToken(
  bucket: string,
  filePath: string,
  userId: string,
  token: string
): Promise<{ valid: boolean; expired: boolean }> {
  try {
    const [expiresStr, signatureB64] = token.split(':');
    const expires = parseInt(expiresStr, 10);

    // Check expiration
    if (Date.now() / 1000 > expires) {
      return { valid: false, expired: true };
    }

    const payload = `${bucket}:${filePath}:${userId}:${expires}`;

    const encoder = new TextEncoder();
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'clippingbd-studio-default-secret';
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const signature = Buffer.from(signatureB64, 'base64url');
    const isValid = await crypto.subtle.verify('HMAC', key, signature, messageData);

    return { valid: isValid, expired: false };
  } catch {
    return { valid: false, expired: false };
  }
}

/**
 * Check if user has permission to access an asset
 */
async function checkAssetPermission(
  userId: string,
  bucket: string,
  _filePath: string,
  userRole: string
): Promise<{ hasAccess: boolean; reason?: string }> {
  // Admin and developers have access to everything
  if (['ADMIN', 'DEVELOPER'].includes(userRole)) {
    return { hasAccess: true };
  }

  // Public bucket is accessible to all authenticated users
  if (PUBLIC_BUCKETS.includes(bucket)) {
    return { hasAccess: true };
  }

  // Check for project-specific permissions
  // In a real app, you'd check if the user owns or has access to the project
  // This is a simplified version

  // For now, allow access to 'uploads' bucket for the user's own files
  if (bucket === 'uploads') {
    // In production, check if the file belongs to the user
    // For now, allow access
    return { hasAccess: true };
  }

  // For 'deliverables', check if user is client or has editor access
  if (bucket === 'deliverables') {
    if (['CLIENT', 'EDITOR', 'QA'].includes(userRole)) {
      return { hasAccess: true };
    }
    return { hasAccess: false, reason: 'You do not have permission to access deliverables' };
  }

  // For 'assets', check if user has editor or higher role
  if (bucket === 'assets') {
    if (['EDITOR', 'QA'].includes(userRole)) {
      return { hasAccess: true };
    }
    return { hasAccess: false, reason: 'You do not have permission to access assets' };
  }

  // For 'profiles', allow access (users can view profile images)
  if (bucket === 'profiles') {
    return { hasAccess: true };
  }

  return { hasAccess: false, reason: 'Access denied' };
}

/**
 * GET /api/proxy/asset/[bucket]/[...path]
 * Serve asset with permission checks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  // Apply rate limiting for asset access
  const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_CONFIGS.asset);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { bucket, path: filePath } = await params;
    const fullPath = filePath.join('/');

    // Validate bucket
    if (!VALID_BUCKETS.includes(bucket as (typeof VALID_BUCKETS)[number])) {
      return NextResponse.json(
        { error: 'Invalid bucket' },
        { status: 400 }
      );
    }

    // Check for signed URL verification
    const signature = request.nextUrl.searchParams.get('sig');
    const userId = request.nextUrl.searchParams.get('user');

    // If this is a public bucket, serve without auth check
    if (PUBLIC_BUCKETS.includes(bucket)) {
      return serveAsset(bucket, fullPath, request);
    }

    // Get authenticated user
    const session = await getSession(request);

    if (!session && !signature) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // If using signed URL, verify it
    if (signature && userId) {
      const verification = await verifySignedUrlToken(bucket, fullPath, userId, signature);

      if (!verification.valid) {
        return NextResponse.json(
          {
            error: verification.expired ? 'Signed URL has expired' : 'Invalid signature',
          },
          { status: 403 }
        );
      }

      // Signed URL is valid, serve the asset
      return serveAsset(bucket, fullPath, request);
    }

    // Regular authentication flow
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Check permissions
    const permission = await checkAssetPermission(
      currentUser.id,
      bucket,
      fullPath,
      currentUser.role
    );

    if (!permission.hasAccess) {
      return NextResponse.json(
        { error: permission.reason || 'Access denied' },
        { status: 403 }
      );
    }

    // Serve the asset
    return serveAsset(bucket, fullPath, request);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Serve the actual asset file
 */
async function serveAsset(bucket: string, filePath: string, request: NextRequest): Promise<NextResponse> {
  // Sanitize path to prevent directory traversal
  const sanitizedPath = filePath.replace(/\.\./g, '').replace(/\/+/g, '/');

  // Build file path
  const fullPath = path.join(/*turbopackIgnore: true*/ STORAGE_PATH, bucket, sanitizedPath);
  const resolvedPath = path.resolve(/*turbopackIgnore: true*/ fullPath);
  const resolvedBucketPath = path.resolve(/*turbopackIgnore: true*/ STORAGE_PATH, bucket);

  // Ensure we're not reading outside the bucket directory
  if (!resolvedPath.startsWith(resolvedBucketPath)) {
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: 400 }
    );
  }

  // Check if file exists
  if (!existsSync(resolvedPath)) {
    // In demo mode, redirect to placeholder
    const placeholderUrl = `https://placehold.co/800x600/1e293b/94a3b8?text=${encodeURIComponent(bucket + '/' + filePath)}`;
    return NextResponse.redirect(placeholderUrl);
  }

  try {
    // Read file
    const fileBuffer = await readFile(resolvedPath);
    const fileStats = await stat(resolvedPath);

    // Determine content type
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.pdf': 'application/pdf',
      '.json': 'application/json',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Create response with file
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Last-Modified': fileStats.mtime.toUTCString(),
      },
    });

    // Add rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(request, RATE_LIMIT_CONFIGS.asset);
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  } catch (error) {
    console.error('Error serving asset:', error);

    // In demo mode, redirect to placeholder on error
    const placeholderUrl = `https://placehold.co/800x600/1e293b/94a3b8?text=${encodeURIComponent(bucket + '/' + filePath)}`;
    return NextResponse.redirect(placeholderUrl);
  }
}

/**
 * POST /api/proxy/asset/[bucket]/[...path]
 * Generate a signed URL for an asset
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  try {
    const { bucket, path: filePath } = await params;
    const fullPath = filePath.join('/');

    // Check authentication
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Check permissions
    const permission = await checkAssetPermission(
      currentUser.id,
      bucket,
      fullPath,
      currentUser.role
    );

    if (!permission.hasAccess) {
      return NextResponse.json(
        { error: permission.reason || 'Access denied' },
        { status: 403 }
      );
    }

    // Parse request body for custom expiration
    let expiresIn = SIGNED_URL_TTL;
    try {
      const body = await request.json();
      if (body.expiresIn && typeof body.expiresIn === 'number' && body.expiresIn > 0) {
        expiresIn = Math.min(body.expiresIn, 86400); // Max 24 hours
      }
    } catch {
      // Body is optional
    }

    // Generate signed URL token
    const token = await generateSignedUrlToken(bucket, fullPath, currentUser.id, expiresIn);

    // Build signed URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const signedUrl = `${baseUrl}/api/proxy/asset/${bucket}/${fullPath}?sig=${token}&user=${currentUser.id}`;

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      expiresIn,
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}
