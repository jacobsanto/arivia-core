import { z } from 'zod';

// ============================================
// COMMON FIELD SCHEMAS
// ============================================

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional()
  .or(z.literal(''));

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(500, 'URL must be less than 500 characters')
  .optional()
  .or(z.literal(''));

export const textAreaSchema = z
  .string()
  .trim()
  .max(2000, 'Text must be less than 2000 characters')
  .optional()
  .or(z.literal(''));

export const requiredTextAreaSchema = z
  .string()
  .trim()
  .min(1, 'This field is required')
  .max(2000, 'Text must be less than 2000 characters');

// ============================================
// USER & AUTHENTICATION SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  avatar: urlSchema,
});

// ============================================
// PROPERTY SCHEMAS
// ============================================

export const propertySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Property name is required')
    .max(200, 'Property name must be less than 200 characters'),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(500, 'Address must be less than 500 characters'),
  property_type: z.enum(['villa', 'apartment', 'house', 'studio'], {
    required_error: 'Property type is required',
  }),
  num_bedrooms: z
    .number()
    .int()
    .min(0, 'Number of bedrooms must be 0 or more')
    .max(20, 'Number of bedrooms must be 20 or less'),
  num_bathrooms: z
    .number()
    .int()
    .min(0, 'Number of bathrooms must be 0 or more')
    .max(20, 'Number of bathrooms must be 20 or less'),
  status: z.enum(['active', 'inactive', 'maintenance'], {
    required_error: 'Status is required',
  }),
  description: textAreaSchema,
});

// ============================================
// MAINTENANCE SCHEMAS
// ============================================

export const maintenanceTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  property: z.string().min(1, 'Property is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Priority is required',
  }),
  dueDate: z.string().min(1, 'Due date is required'),
  assignee: z.string().optional(),
  description: requiredTextAreaSchema,
  location: z
    .string()
    .trim()
    .max(200, 'Location must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  requiredTools: textAreaSchema,
});

// ============================================
// DAMAGE REPORT SCHEMAS
// ============================================

export const damageReportSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: requiredTextAreaSchema,
  property_id: z.string().min(1, 'Property is required'),
  damage_date: z.string().min(1, 'Damage date is required'),
  estimated_cost: z
    .number()
    .min(0, 'Cost must be 0 or more')
    .max(1000000, 'Cost must be less than 1,000,000')
    .optional(),
  status: z.enum([
    'pending',
    'investigating',
    'resolved',
    'compensation_required',
    'compensation_paid',
    'closed'
  ]).default('pending'),
});

// ============================================
// INVENTORY SCHEMAS
// ============================================

export const inventoryItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Item name is required')
    .max(200, 'Item name must be less than 200 characters'),
  category: z.string().min(1, 'Category is required'),
  quantity: z
    .number()
    .int()
    .min(0, 'Quantity must be 0 or more')
    .max(100000, 'Quantity must be less than 100,000'),
  min_quantity: z
    .number()
    .int()
    .min(0, 'Minimum quantity must be 0 or more')
    .max(100000, 'Minimum quantity must be less than 100,000')
    .optional(),
  unit: z.string().max(50, 'Unit must be less than 50 characters').optional(),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  notes: textAreaSchema,
});

export const stockTransferSchema = z.object({
  item_id: z.string().min(1, 'Item is required'),
  from_location: z.string().min(1, 'Source location is required'),
  to_location: z.string().min(1, 'Destination location is required'),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(100000, 'Quantity must be less than 100,000'),
  notes: textAreaSchema,
}).refine((data) => data.from_location !== data.to_location, {
  message: 'Source and destination locations must be different',
  path: ['to_location'],
});

// ============================================
// CHAT & MESSAGING SCHEMAS
// ============================================

export const chatMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be less than 5000 characters'),
  channel_id: z.string().optional(),
  conversation_id: z.string().optional(),
  reply_to_id: z.string().optional(),
}).refine((data) => data.channel_id || data.conversation_id, {
  message: 'Either channel_id or conversation_id is required',
  path: ['channel_id'],
});

// ============================================
// BOOKING SCHEMAS
// ============================================

export const bookingSchema = z.object({
  property_id: z.string().min(1, 'Property is required'),
  guest_name: nameSchema,
  guest_email: emailSchema,
  guest_phone: phoneSchema,
  check_in: z.string().min(1, 'Check-in date is required'),
  check_out: z.string().min(1, 'Check-out date is required'),
  num_guests: z
    .number()
    .int()
    .min(1, 'Number of guests must be at least 1')
    .max(50, 'Number of guests must be 50 or less'),
  special_requests: textAreaSchema,
}).refine((data) => {
  const checkIn = new Date(data.check_in);
  const checkOut = new Date(data.check_out);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['check_out'],
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Sanitize string input for safe storage and display
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 5000); // Enforce max length
}

/**
 * Validate and sanitize URL for safe external API calls
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Safe encoding for URL parameters
 */
export function safeEncodeURIComponent(str: string): string {
  try {
    return encodeURIComponent(str);
  } catch {
    return '';
  }
}

/**
 * Type-safe form data extractor
 */
export function extractFormData<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new Error(result.error.errors[0].message);
  }
  
  return result.data;
}
