import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { getStorage } from '@/lib/storage';
import { checkRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

/**
 * Allowed MIME types for upload
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/tiff',
  'image/bmp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'application/pdf',
  'application/zip',
  'application/x-rar-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/json',
];

/**
 * Check if MIME type is allowed
 */
function isAllowedMimeType(mimeType: string): boolean {
  if (!mimeType) return false;
  
  // Check exact match
  if (ALLOWED_MIME_TYPES.includes(mimeType)) return true;
  
  // Check prefix match for images
  if (mimeType.startsWith('image/')) return true;
  
  return false;
}

/**
 * Max file size: 100MB
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

/**
 * POST /api/upload
 * Upload a file and create an asset record
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  // Rate limiting check
  const rateLimitResult = checkRateLimit(request, RATE_LIMIT_CONFIGS.upload);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.message || 'Rate limit exceeded for uploads' },
      { status: 429 }
    );
  }

  // Require authentication
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error!;
  }

  try {
    const formData = await request.formData();

    // Extract fields
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'assets';
    const path = formData.get('path') as string | null;
    const orderId = formData.get('orderId') as string | null;
    const isPublic = formData.get('isPublic') === 'true';

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Validate file type
    if (!isAllowedMimeType(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed` },
        { status: 415 }
      );
    }

    // Validate file extension from name (additional check)
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|svg|tiff|bmp|mp4|mov|avi|mkv|pdf|zip|rar|doc|docx|txt|json)$/i;
    if (!allowedExtensions.test(file.name)) {
      return NextResponse.json(
        { error: 'File extension not allowed' },
        { status: 415 }
      );
    }

    // Sanitize filename (remove path traversal)
    const sanitizedName = file.name.replace(/\.\./g, '').replace(/[\\/]/g, '');
    if (sanitizedName !== file.name) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Upload file using storage service
    const storage = getStorage();
    const uploadResult = await storage.upload(bucket, path, file, {
      isPublic,
      cacheControl: 'public, max-age=31536000, immutable',
    });

    if (!uploadResult.success) {
      console.error('Storage upload failed:', uploadResult.error);
      return NextResponse.json(
        { error: uploadResult.error || 'File upload failed' },
        { status: 500 }
      );
    }

    // Create asset record in database
    const asset = await db.asset.create({
      data: {
        userId: authResult.userId!,
        orderId: orderId || null,
        filename: sanitizedName,
        originalName: sanitizedName,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        bucket,
        path: uploadResult.path || path,
        url: uploadResult.url || '',
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
