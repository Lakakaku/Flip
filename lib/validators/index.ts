// Validation schemas and utilities
import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// User settings validation
export const notificationPreferencesSchema = z.object({
  discord_enabled: z.boolean(),
  discord_user_id: z.string().optional(),
  email_enabled: z.boolean(),
  sms_enabled: z.boolean().optional(),
  min_profit_margin: z.number().min(0).max(1000),
  max_distance: z.number().min(0).max(1000).optional()
});

// Listing validation
export const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  price: z.number().positive('Price must be positive'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  location: z.string().min(2, 'Location is required'),
  images: z.array(z.string().url()).min(1, 'At least one image is required')
});

// Validation helper functions
export function validateEmail(email: string): boolean {
  return loginSchema.pick({ email: true }).safeParse({ email }).success;
}

export function validatePassword(password: string): boolean {
  return registerSchema.pick({ password: true }).safeParse({ password }).success;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type NotificationPreferencesData = z.infer<typeof notificationPreferencesSchema>;
export type ListingData = z.infer<typeof listingSchema>;

// Profile management validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"]
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  locationCity: z.string().min(1, 'City is required').max(100, 'City name too long'),
  locationRegion: z.string().min(1, 'Region is required').max(100, 'Region name too long'),
});

export const deleteAccountSchema = z.object({
  confirmation: z.string().refine(val => val === 'DELETE', 'You must type DELETE to confirm'),
  currentPassword: z.string().min(1, 'Password is required for account deletion'),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;