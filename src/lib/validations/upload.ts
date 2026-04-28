import { z } from 'zod';

/**
 * Allowed MIME types for file uploads
 */
export const ALLOWED_MIME_TYPES = {
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
  ],
  video: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/mpeg',
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  archive: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ],
} as const;

/**
 * All allowed MIME types flattened
 */
export const ALL_ALLOWED_MIME_TYPES = Object.values(ALLOWED_MIME_TYPES).flat();

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  image: 50 * 1024 * 1024, // 50MB
  video: 500 * 1024 * 1024, // 500MB
  document: 25 * 1024 * 1024, // 25MB
  archive: 100 * 1024 * 1024, // 100MB
  default: 50 * 1024 * 1024, // 50MB default
} as const;

/**
 * Allowed file extensions
 */
export const ALLOWED_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif'],
  video: ['mp4', 'webm', 'mov', 'avi', 'wmv', 'mpeg', 'mpg'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
} as const;

/**
 * Bucket names for storage
 */
export const VALID_BUCKETS = [
  'assets',
  'deliverables',
  'uploads',
  'public',
  'profiles',
  'projects',
] as const;

/**
 * File type category
 */
export type FileCategory = keyof typeof ALLOWED_MIME_TYPES;

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): FileCategory | null {
  const categoryMap: Record<string, FileCategory> = {};
  for (const [category, types] of Object.entries(ALLOWED_MIME_TYPES)) {
    for (const type of types) {
      categoryMap[type] = category as FileCategory;
    }
  }
  return categoryMap[mimeType] || null;
}

/**
 * Get file size limit for a given MIME type
 */
export function getFileSizeLimit(mimeType: string): number {
  const category = getFileCategory(mimeType);
  return category ? FILE_SIZE_LIMITS[category] : FILE_SIZE_LIMITS.default;
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename: string, mimeType: string): boolean {
  const category = getFileCategory(mimeType);
  if (!category) return false;

  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return false;

  const allowed = ALLOWED_EXTENSIONS[category] as readonly string[];
  return allowed.includes(extension);
}

/**
 * Upload metadata validation schema
 */
export const uploadMetadataSchema = z.object({
  bucket: z.enum(VALID_BUCKETS, {
    message: 'Invalid bucket name',
  }).default('uploads'),
  path: z.string()
    .max(500, 'Path must be less than 500 characters')
    .regex(/^[\w\-./]+$/, 'Path can only contain letters, numbers, hyphens, underscores, dots, and forward slashes')
    .optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPublic: z.boolean().default(false).optional(),
});

/**
 * File validation schema (for use with FormData)
 */
export const fileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required').max(255, 'File name is too long'),
  type: z.string().refine(
    (type) => ALL_ALLOWED_MIME_TYPES.includes(type as (typeof ALL_ALLOWED_MIME_TYPES)[number]),
    { message: 'File type not allowed' }
  ),
  size: z.number()
    .min(1, 'File cannot be empty')
    .max(FILE_SIZE_LIMITS.default, 'File size exceeds limit'),
});

/**
 * Complete upload request validation schema
 */
export const uploadRequestSchema = z.object({
  file: fileValidationSchema,
  metadata: uploadMetadataSchema.optional(),
});

/**
 * Validate file for upload
 */
export function validateFile(file: File): {
  success: boolean;
  error?: string;
  category?: FileCategory;
  maxSize?: number;
} {
  // Check if file exists
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided or file is empty' };
  }

  // Check MIME type
  const category = getFileCategory(file.type);
  if (!category) {
    return {
      success: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
    };
  }

  // Check file size for category
  const maxSize = FILE_SIZE_LIMITS[category];
  if (file.size > maxSize) {
    return {
      success: false,
      error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit for ${category} files`,
      category,
      maxSize,
    };
  }

  // Validate extension matches MIME type
  if (!validateFileExtension(file.name, file.type)) {
    return {
      success: false,
      error: 'File extension does not match the file type',
      category,
      maxSize,
    };
  }

  return { success: true, category, maxSize };
}

/**
 * Validate upload metadata
 */
export function validateUploadMetadata(data: unknown) {
  return uploadMetadataSchema.safeParse(data);
}

/**
 * Validate complete upload request
 */
export function validateUploadRequest(data: unknown) {
  return uploadRequestSchema.safeParse(data);
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let sanitized = filename.replace(/[/\\:\x00]/g, '_');

  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length but preserve extension
  const maxNameLength = 200;
  if (sanitized.length > maxNameLength) {
    const lastDot = sanitized.lastIndexOf('.');
    if (lastDot > 0 && lastDot > sanitized.length - 10) {
      const ext = sanitized.slice(lastDot);
      sanitized = sanitized.slice(0, maxNameLength - ext.length) + ext;
    } else {
      sanitized = sanitized.slice(0, maxNameLength);
    }
  }

  return sanitized;
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
  const sanitized = sanitizeFilename(originalName);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  const lastDot = sanitized.lastIndexOf('.');
  if (lastDot > 0) {
    const name = sanitized.slice(0, lastDot);
    const ext = sanitized.slice(lastDot);
    return `${timestamp}-${randomSuffix}-${name}${ext}`;
  }

  return `${timestamp}-${randomSuffix}-${sanitized}`;
}

/**
 * Type exports
 */
export type UploadMetadata = z.infer<typeof uploadMetadataSchema>;
export type FileValidation = z.infer<typeof fileValidationSchema>;
export type UploadRequest = z.infer<typeof uploadRequestSchema>;
