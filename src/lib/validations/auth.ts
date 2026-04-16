import { z } from 'zod';

/**
 * Password requirements:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    'Password must contain at least one special character'
  );

/**
 * Simple password schema for demo/login (less strict)
 * Minimum 6 characters to allow demo passwords
 */
const simplePasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be less than 100 characters');

/**
 * Email validation schema
 */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')
  .transform((email) => email.toLowerCase().trim());

/**
 * Name validation schema
 */
const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .transform((name) => name.trim());

/**
 * Login request validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Signup request validation schema
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER', 'PARTNER']).optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Password reset request validation schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset validation schema
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Email verification validation schema
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

/**
 * Update profile validation schema
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().nullable(),
});

/**
 * Type exports for inferred types
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Validate and parse login data
 */
export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}

/**
 * Validate and parse signup data
 */
export function validateSignup(data: unknown) {
  return signupSchema.safeParse(data);
}

/**
 * Validate and parse password change data
 */
export function validatePasswordChange(data: unknown) {
  return passwordChangeSchema.safeParse(data);
}

/**
 * Validate and parse password reset request data
 */
export function validatePasswordResetRequest(data: unknown) {
  return passwordResetRequestSchema.safeParse(data);
}

/**
 * Validate and parse password reset data
 */
export function validatePasswordReset(data: unknown) {
  return passwordResetSchema.safeParse(data);
}

/**
 * Validate and parse profile update data
 */
export function validateUpdateProfile(data: unknown) {
  return updateProfileSchema.safeParse(data);
}
