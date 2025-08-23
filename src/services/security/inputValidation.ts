/**
 * Enhanced input validation service
 * Comprehensive validation for all user inputs
 */
import { sanitizeString, sanitizeEmail, sanitizeUrl, sanitizeObject } from './inputSanitizer';

/**
 * Validate email format with additional security checks
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const sanitized = sanitizeEmail(email);
  
  // Enhanced email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /script/i,
    /<.*>/,
    /javascript:/i,
    /on\w+=/i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(email))) {
    return { isValid: false, error: 'Invalid characters in email' };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string; strength: number } => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 0 };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters', strength: 0 };
  }

  let strength = 0;
  
  // Length bonus
  if (password.length >= 12) strength += 2;
  else if (password.length >= 10) strength += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[^a-zA-Z\d]/.test(password)) strength += 1;
  
  // Common password check
  const commonPasswords = [
    'password', '123456', 'admin', 'login', 'welcome',
    'qwerty', 'letmein', 'password123', 'admin123'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    return { isValid: false, error: 'Password is too common', strength: 0 };
  }

  const isValid = strength >= 4;
  
  return { 
    isValid, 
    error: isValid ? undefined : 'Password is too weak',
    strength: Math.min(5, strength)
  };
};

/**
 * Validate and sanitize form data
 */
export const validateFormData = (data: Record<string, any>): {
  isValid: boolean;
  sanitizedData: Record<string, any>;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  const sanitizedData = sanitizeObject(data);

  // Check each field
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Check for XSS patterns
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
      ];

      if (xssPatterns.some(pattern => pattern.test(value))) {
        errors[key] = 'Invalid characters detected';
      }

      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
        /(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)/i,
        /'.*OR.*'/i,
        /--/,
        /\/\*/
      ];

      if (sqlPatterns.some(pattern => pattern.test(value))) {
        errors[key] = 'Invalid input detected';
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    sanitizedData,
    errors
  };
};

/**
 * Rate limiting for form submissions
 */
class FormSubmissionLimiter {
  private submissions: Map<string, number[]> = new Map();
  private readonly maxSubmissions = 5;
  private readonly timeWindow = 60000; // 1 minute

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const submissions = this.submissions.get(identifier) || [];
    
    // Remove old submissions
    const recentSubmissions = submissions.filter(time => now - time < this.timeWindow);
    
    if (recentSubmissions.length >= this.maxSubmissions) {
      return true;
    }

    // Add current submission
    recentSubmissions.push(now);
    this.submissions.set(identifier, recentSubmissions);
    
    return false;
  }

  reset(identifier: string): void {
    this.submissions.delete(identifier);
  }
}

export const formLimiter = new FormSubmissionLimiter();

/**
 * Validate file uploads
 */
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Size limit (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }

  // Allowed types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx'];
  
  if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
    return { isValid: false, error: 'File extension not allowed' };
  }

  return { isValid: true };
};