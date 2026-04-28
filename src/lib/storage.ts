/**
 * Unified Storage Service
 * Provides seamless fallback between Supabase Storage and local filesystem
 * 
 * Features:
 * - Automatic provider selection based on configuration
 * - Signed URL generation for private files
 * - File upload/download with metadata
 * - Bucket management
 */

import { createClient, createAdminClient, isSupabaseConfigured } from './supabase/server'
import { writeFile, readFile, unlink, mkdir, access } from 'fs/promises'
import { existsSync, statSync, readdirSync } from 'fs'
import path from 'path'

// ==================== Types ====================

export interface StorageConfig {
  isSupabaseConfigured: boolean
  localStoragePath: string
  buckets: Record<string, string>
}

export interface StorageResult {
  success: boolean
  url?: string
  path?: string
  signedUrl?: string
  expiresAt?: Date
  error?: string
}

export interface FileMetadata {
  id: string
  originalName: string
  mimeType: string
  size: number
  bucket: string
  path: string
  url?: string
  createdAt: Date
}

export interface SignedUrlOptions {
  expiresIn?: number // seconds
  download?: boolean
  transform?: {
    width?: number
    height?: number
    resize?: 'cover' | 'contain' | 'fill'
    quality?: number
    format?: 'origin' | 'avif' | 'webp' | 'jpg' | 'png'
  }
}

export interface UploadOptions {
  contentType?: string
  upsert?: boolean
  cacheControl?: string
  isPublic?: boolean
}

// ==================== Configuration ====================

const STORAGE_CONFIG: StorageConfig = {
  isSupabaseConfigured: isSupabaseConfigured(),
  localStoragePath: process.env.LOCAL_STORAGE_PATH || './uploads',
  buckets: {
    assets: 'assets',
    avatars: 'avatars',
    deliverables: 'deliverables',
    sourceFiles: 'source-files',
    portfolio: 'portfolio',
    temporary: 'temporary',
  },
}

// ==================== Storage Service Class ====================

/**
 * Storage Service Class
 * Handles file operations with automatic fallback between Supabase and local storage
 */
export class StorageService {
  private useSupabase: boolean
  private initialized: boolean = false

  constructor() {
    this.useSupabase = STORAGE_CONFIG.isSupabaseConfigured
    this.initialize()
  }

  private log(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[StorageService] ${message}`, ...args)
    }
  }

  /**
   * Initialize storage service
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return

    await this.ensureLocalStorageExists()
    this.initialized = true
    this.log(`Initialized with ${this.useSupabase ? 'Supabase' : 'local'} storage`)
  }

  /**
   * Ensure local storage directory exists
   */
  private async ensureLocalStorageExists(): Promise<void> {
    const storagePath = STORAGE_CONFIG.localStoragePath
    
    if (!existsSync(storagePath)) {
      await mkdir(storagePath, { recursive: true })
    }

    // Create bucket directories
    for (const bucket of Object.values(STORAGE_CONFIG.buckets)) {
      const bucketPath = path.join(storagePath, bucket)
      if (!existsSync(bucketPath)) {
        await mkdir(bucketPath, { recursive: true })
      }
    }
  }

  /**
   * Get the storage type being used
   */
  getStorageType(): 'supabase' | 'local' {
    return this.useSupabase ? 'supabase' : 'local'
  }

  /**
   * Check if storage is ready
   */
  async isReady(): Promise<boolean> {
    await this.initialize()
    
    if (this.useSupabase) {
      return true
    }
    
    return existsSync(STORAGE_CONFIG.localStoragePath)
  }

  // ==================== Upload Operations ====================

  /**
   * Upload a file
   */
  async upload(
    bucket: string,
    filePath: string,
    file: File | Buffer | ArrayBuffer,
    options?: UploadOptions
  ): Promise<StorageResult> {
    await this.initialize()

    try {
      if (this.useSupabase) {
        return await this.uploadToSupabase(bucket, filePath, file, options)
      } else {
        return await this.uploadToLocal(bucket, filePath, file)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed'
      this.log('Upload error:', errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Upload to Supabase Storage
   */
  private async uploadToSupabase(
    bucket: string,
    filePath: string,
    file: File | Buffer | ArrayBuffer,
    options?: UploadOptions
  ): Promise<StorageResult> {
    try {
      const supabase = await createClient()
      if (!supabase) {
        this.log('Supabase client not available, falling back to local')
        return this.uploadToLocal(bucket, filePath, file)
      }

      let fileBuffer: ArrayBuffer | Uint8Array
      let contentType = options?.contentType || 'application/octet-stream'

      if (file instanceof File) {
        fileBuffer = new Uint8Array(await file.arrayBuffer())
        contentType = file.type || contentType
      } else if (file instanceof Buffer) {
        fileBuffer = new Uint8Array(file)
      } else {
        fileBuffer = new Uint8Array(file)
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: options?.upsert || false,
          cacheControl: options?.cacheControl || '3600',
        })

      if (error) {
        this.log('Supabase upload error:', error)
        // Fallback to local storage
        return this.uploadToLocal(bucket, filePath, file)
      }

      // Get URL based on public/private
      let url: string
      if (options?.isPublic) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
        url = urlData?.publicUrl || ''
      } else {
        const { data: urlData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(data.path, 3600) // 1 hour default
        url = urlData?.signedUrl || ''
      }

      return {
        success: true,
        url,
        path: data.path,
      }
    } catch (error) {
      this.log('Supabase upload error, falling back to local:', error)
      return this.uploadToLocal(bucket, filePath, file)
    }
  }

  /**
   * Upload to local filesystem
   */
  private async uploadToLocal(
    bucket: string,
    filePath: string,
    file: File | Buffer | ArrayBuffer
  ): Promise<StorageResult> {
    try {
      await this.ensureLocalStorageExists()

      const fullPath = path.join(STORAGE_CONFIG.localStoragePath, bucket, filePath)
      const dir = path.dirname(fullPath)

      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }

      let buffer: Buffer
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else if (file instanceof ArrayBuffer) {
        buffer = Buffer.from(file)
      } else {
        buffer = file
      }

      await writeFile(fullPath, buffer)

      // Return a local URL path
      const localUrl = `/api/proxy/asset/${bucket}/${filePath}`

      return {
        success: true,
        url: localUrl,
        path: `${bucket}/${filePath}`,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Local storage upload failed'
      this.log('Local upload error:', errorMsg)
      throw error
    }
  }

  // ==================== Download Operations ====================

  /**
   * Download a file
   */
  async download(bucket: string, filePath: string): Promise<Buffer | null> {
    await this.initialize()

    try {
      if (this.useSupabase) {
        const supabase = await createClient()
        if (supabase) {
          const { data, error } = await supabase.storage
            .from(bucket)
            .download(filePath)

          if (error) throw error

          return Buffer.from(await data.arrayBuffer())
        }
      }

      // Local storage fallback
      const fullPath = path.join(STORAGE_CONFIG.localStoragePath, bucket, filePath)
      if (existsSync(fullPath)) {
        return await readFile(fullPath)
      }

      return null
    } catch (error) {
      this.log('Download error:', error)
      return null
    }
  }

  // ==================== Signed URL Operations ====================

  /**
   * Get a signed URL for a private file
   */
  async getSignedUrl(
    bucket: string,
    filePath: string,
    options?: SignedUrlOptions
  ): Promise<StorageResult> {
    await this.initialize()

    const expiresIn = options?.expiresIn || 3600 // 1 hour default

    try {
      if (this.useSupabase) {
        const supabase = await createClient()
        if (supabase) {
          // Build transformation options
          const transform = options?.transform ? {
            width: options.transform.width,
            height: options.transform.height,
            resize: options.transform.resize,
            quality: options.transform.quality,
          } : undefined

          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, expiresIn, {
              download: options?.download,
              transform,
            })

          if (error) throw error

          return {
            success: true,
            signedUrl: data.signedUrl,
            url: data.signedUrl,
            expiresAt: new Date(Date.now() + expiresIn * 1000),
            path: filePath,
          }
        }
      }

      // Local storage - just return the proxy URL
      const localUrl = `/api/proxy/asset/${bucket}/${filePath}`
      return {
        success: true,
        url: localUrl,
        signedUrl: localUrl,
        path: filePath,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create signed URL'
      this.log('Signed URL error:', errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Get multiple signed URLs
   */
  async getSignedUrls(
    bucket: string,
    filePaths: string[],
    expiresIn?: number
  ): Promise<StorageResult[]> {
    const results = await Promise.all(
      filePaths.map(path => this.getSignedUrl(bucket, path, { expiresIn }))
    )
    return results
  }

  /**
   * Get public URL (for public buckets)
   */
  getPublicUrl(bucket: string, filePath: string): string {
    if (this.useSupabase) {
      // Note: This is synchronous, so we can't use the async client
      // Return a proxy URL that will handle this
      return `/api/proxy/asset/${bucket}/${filePath}`
    }
    return `/api/proxy/asset/${bucket}/${filePath}`
  }

  // ==================== Delete Operations ====================

  /**
   * Delete a file
   */
  async delete(bucket: string, filePath: string): Promise<StorageResult> {
    await this.initialize()

    try {
      if (this.useSupabase) {
        const supabase = await createClient()
        if (supabase) {
          const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath])

          if (error) throw error
        }
      } else {
        const fullPath = path.join(STORAGE_CONFIG.localStoragePath, bucket, filePath)
        if (existsSync(fullPath)) {
          await unlink(fullPath)
        }
      }

      return { success: true, path: filePath }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Delete failed'
      this.log('Delete error:', errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultiple(bucket: string, filePaths: string[]): Promise<StorageResult[]> {
    const results = await Promise.all(
      filePaths.map(path => this.delete(bucket, path))
    )
    return results
  }

  // ==================== File Info Operations ====================

  /**
   * Check if a file exists
   */
  async exists(bucket: string, filePath: string): Promise<boolean> {
    await this.initialize()

    try {
      if (this.useSupabase) {
        const supabase = await createAdminClient()
        if (supabase) {
          const { data, error } = await supabase.storage
            .from(bucket)
            .list(path.dirname(filePath), {
              search: path.basename(filePath),
              limit: 1,
            })

          if (error) throw error
          return data.length > 0
        }
      }

      // Local storage check
      const fullPath = path.join(STORAGE_CONFIG.localStoragePath, bucket, filePath)
      return existsSync(fullPath)
    } catch {
      return false
    }
  }

  /**
   * Get file metadata
   */
  async getFileInfo(bucket: string, filePath: string): Promise<FileMetadata | null> {
    await this.initialize()

    try {
      if (this.useSupabase) {
        const supabase = await createAdminClient()
        if (supabase) {
          const { data, error } = await supabase.storage
            .from(bucket)
            .list(path.dirname(filePath), {
              search: path.basename(filePath),
              limit: 1,
            })

          if (error) throw error
          if (data.length === 0) return null

          const file = data[0]
          return {
            id: file.id || filePath,
            originalName: file.name,
            mimeType: file.metadata?.mimetype || 'application/octet-stream',
            size: file.metadata?.size || 0,
            bucket,
            path: filePath,
            createdAt: new Date(file.created_at || Date.now()),
          }
        }
      }

      // Local storage check
      const fullPath = path.join(STORAGE_CONFIG.localStoragePath, bucket, filePath)
      if (existsSync(fullPath)) {
        const stats = statSync(fullPath)
        return {
          id: filePath,
          originalName: path.basename(filePath),
          mimeType: 'application/octet-stream',
          size: stats.size,
          bucket,
          path: filePath,
          createdAt: stats.birthtime,
        }
      }

      return null
    } catch {
      return null
    }
  }

  // ==================== Bucket Operations ====================

  /**
   * List files in a bucket
   */
  async listFiles(
    bucket: string,
    folder?: string,
    options?: {
      limit?: number
      offset?: number
      sortBy?: { column: string; order: 'asc' | 'desc' }
    }
  ): Promise<{ files: FileMetadata[]; error?: string }> {
    await this.initialize()

    try {
      if (this.useSupabase) {
        const supabase = await createClient()
        if (supabase) {
          const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder || '', {
              limit: options?.limit || 100,
              offset: options?.offset || 0,
              sortBy: options?.sortBy,
            })

          if (error) throw error

          const files = data
            .filter(item => item.id && !item.id.endsWith('/')) // Filter out folders
            .map(item => ({
              id: item.id!,
              originalName: item.name,
              mimeType: item.metadata?.mimetype || 'application/octet-stream',
              size: item.metadata?.size || 0,
              bucket,
              path: folder ? `${folder}/${item.name}` : item.name,
              createdAt: new Date(item.created_at || Date.now()),
            }))

          return { files }
        }
      }

      // Local storage - read directory
      const folderPath = folder 
        ? path.join(STORAGE_CONFIG.localStoragePath, bucket, folder)
        : path.join(STORAGE_CONFIG.localStoragePath, bucket)

      if (existsSync(folderPath)) {
        const files = readdirSync(folderPath)
          .filter((name: string) => {
            const fullPath = path.join(folderPath, name)
            return !statSync(fullPath).isDirectory()
          })
          .slice(options?.offset || 0, options?.limit || 100)
          .map((name: string) => {
            const fullPath = path.join(folderPath, name)
            const stats = statSync(fullPath)
            return {
              id: name,
              originalName: name,
              mimeType: 'application/octet-stream',
              size: stats.size,
              bucket,
              path: folder ? `${folder}/${name}` : name,
              createdAt: stats.birthtime,
            }
          })

        return { files }
      }

      return { files: [] }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'List files failed'
      this.log('List files error:', errorMsg)
      return { files: [], error: errorMsg }
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Copy a file
   */
  async copy(
    sourceBucket: string,
    sourcePath: string,
    destBucket: string,
    destPath: string
  ): Promise<StorageResult> {
    const file = await this.download(sourceBucket, sourcePath)
    if (!file) {
      return { success: false, error: 'Source file not found' }
    }

    return this.upload(destBucket, destPath, file)
  }

  /**
   * Move a file
   */
  async move(
    sourceBucket: string,
    sourcePath: string,
    destBucket: string,
    destPath: string
  ): Promise<StorageResult> {
    const result = await this.copy(sourceBucket, sourcePath, destBucket, destPath)
    
    if (result.success) {
      await this.delete(sourceBucket, sourcePath)
    }

    return result
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    type: 'supabase' | 'local'
    totalFiles?: number
    totalSize?: number
    buckets?: string[]
  }> {
    const type = this.getStorageType()

    if (type === 'local') {
      try {
        let totalFiles = 0
        let totalSize = 0
        const buckets: string[] = []

        for (const bucket of Object.keys(STORAGE_CONFIG.buckets)) {
          const bucketPath = path.join(STORAGE_CONFIG.localStoragePath, bucket)
          if (existsSync(bucketPath)) {
            buckets.push(bucket)
            const files = readdirSync(bucketPath, { recursive: true })
            for (const file of files) {
              const fullPath = path.join(bucketPath, file as string)
              try {
                const stats = statSync(fullPath)
                if (stats.isFile()) {
                  totalFiles++
                  totalSize += stats.size
                }
              } catch {
                // Ignore errors for individual files
              }
            }
          }
        }

        return { type, totalFiles, totalSize, buckets }
      } catch {
        return { type }
      }
    }

    return { type, buckets: Object.keys(STORAGE_CONFIG.buckets) }
  }
}

// ==================== Singleton Instance ====================

let storageInstance: StorageService | null = null

/**
 * Get the storage service singleton
 */
export function getStorage(): StorageService {
  if (!storageInstance) {
    storageInstance = new StorageService()
  }
  return storageInstance
}

/**
 * Reset the storage service (useful for testing)
 */
export function resetStorage(): void {
  storageInstance = null
}

// ==================== Convenience Exports ====================

// Default bucket names
export const BUCKETS = STORAGE_CONFIG.buckets

// Default export
export const storage = getStorage()
