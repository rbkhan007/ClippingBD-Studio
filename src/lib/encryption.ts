/**
 * Encryption Helper
 * 
 * Provides AES-256-GCM encryption for sensitive payment gateway credentials.
 * Uses a server-side encryption key stored in environment variables.
 */

import * as crypto from 'crypto';

// Get encryption key from environment (should be 32 bytes for AES-256)
// In production, this MUST be set in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'clippingbd-default-encryption-32b!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Initialization vector length
const AUTH_TAG_LENGTH = 16; // GCM authentication tag length

/**
 * Check if using default encryption key (not secure for production)
 */
export function isUsingDefaultKey(): boolean {
  return !process.env.ENCRYPTION_KEY;
}

/**
 * Ensure the encryption key is exactly 32 bytes
 */
function getEncryptionKey(): Buffer {
  // Derive a 32-byte key using SHA-256 hash
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypt a sensitive value (like API secret keys)
 * 
 * @param value - The plaintext value to encrypt
 * @returns Encrypted value as base64 string (iv:authTag:encrypted)
 */
export function encrypt(value: string): string {
  if (!value) {
    throw new Error('Value to encrypt cannot be empty');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(value, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Return format: iv:authTag:encrypted (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted value
 * 
 * @param encryptedValue - The encrypted value (iv:authTag:encrypted format)
 * @returns Decrypted plaintext value
 */
export function decrypt(encryptedValue: string): string {
  if (!encryptedValue) {
    throw new Error('Encrypted value cannot be empty');
  }

  const parts = encryptedValue.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format');
  }

  const [ivBase64, authTagBase64, encrypted] = parts;
  
  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypt an object (converts to JSON first)
 * 
 * @param obj - Object to encrypt
 * @returns Encrypted JSON string
 */
export function encryptObject(obj: Record<string, unknown>): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt to an object
 * 
 * @param encryptedValue - Encrypted JSON string
 * @returns Decrypted object
 */
export function decryptObject<T = Record<string, unknown>>(encryptedValue: string): T {
  const decrypted = decrypt(encryptedValue);
  return JSON.parse(decrypted) as T;
}

/**
 * Mask a sensitive value for display (show last 4 characters)
 * 
 * @param value - Value to mask
 * @param visibleChars - Number of characters to show at the end
 * @returns Masked value
 */
export function maskSensitiveValue(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) {
    return '****';
  }
  return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

/**
 * Check if a value is already encrypted (has our format)
 * 
 * @param value - Value to check
 * @returns Whether the value appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 3 && 
    Buffer.from(parts[0], 'base64').length === IV_LENGTH &&
    Buffer.from(parts[1], 'base64').length === AUTH_TAG_LENGTH;
}

/**
 * Generate a secure random string
 * 
 * @param length - Length of the random string
 * @returns Random hex string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a value using SHA-256 (one-way, for webhook signatures etc.)
 * 
 * @param value - Value to hash
 * @returns SHA-256 hash as hex string
 */
export function hashSha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Verify a webhook signature using HMAC-SHA256
 * 
 * @param payload - Raw payload string
 * @param signature - Signature to verify
 * @param secret - Secret key for verification
 * @returns Whether the signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Named exports are preferred for tree-shaking
// Use individual imports: import { encrypt, decrypt } from '@/lib/encryption'

/**
 * Get the encryption key status for health checks
 */
export function getEncryptionStatus(): { hasKey: boolean; keySource: string } {
  const hasKey = !!process.env.ENCRYPTION_KEY;
  const keySource = process.env.ENCRYPTION_KEY ? 'environment' : 'default';
  return { hasKey, keySource };
}

/**
 * Validate that encryption is properly configured
 * Call this at startup to ensure encryption is working
 */
export function validateEncryption(): void {
  const testValue = 'test-encryption-value';
  try {
    const encrypted = encrypt(testValue);
    const decrypted = decrypt(encrypted);
    if (decrypted !== testValue) {
      throw new Error('Encryption validation failed: decrypt mismatch');
    }
  } catch (error) {
    console.error('Encryption validation failed:', error);
    throw error;
  }
}
