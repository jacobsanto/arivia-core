/**
 * Production-safe logger that prevents sensitive data exposure
 */
import { logger } from '@/services/logger';

// Sensitive patterns to redact
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /session/i,
  /cookie/i,
  /credential/i,
  /email/i,
  /phone/i,
  /ssn/i,
  /credit.*card/i,
  /social.*security/i
];

// Fields that should be completely removed
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'passwordSalt',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'private_key',
  'api_key',
  'session_id',
  'auth_token'
];

/**
 * Sanitize data to remove sensitive information
 */
const sanitizeData = (data: any): any => {
  if (typeof data === 'string') {
    // Check for sensitive patterns
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(data)) {
        return '[REDACTED]';
      }
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Remove sensitive fields completely
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Check if key contains sensitive patterns
      if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Recursively sanitize nested objects
      sanitized[key] = sanitizeData(value);
    }
    
    return sanitized;
  }

  return data;
};

/**
 * Production-safe logger with automatic data sanitization
 */
export const secureLogger = {
  debug: (component: string, message: string, data?: any) => {
    const sanitizedData = data ? sanitizeData(data) : undefined;
    logger.debug(component, message, sanitizedData);
  },

  info: (component: string, message: string, data?: any) => {
    const sanitizedData = data ? sanitizeData(data) : undefined;
    logger.info(component, message, sanitizedData);
  },

  warn: (component: string, message: string, data?: any) => {
    const sanitizedData = data ? sanitizeData(data) : undefined;
    logger.warn(component, message, sanitizedData);
  },

  error: (component: string, message: string, data?: any) => {
    const sanitizedData = data ? sanitizeData(data) : undefined;
    logger.error(component, message, sanitizedData);
  }
};

/**
 * Replace console methods in production to prevent accidental logging
 */
export const disableConsoleInProduction = () => {
  if (process.env.NODE_ENV === 'production') {
    const noop = () => {};
    
    // Override console methods
    console.log = noop;
    console.debug = noop;
    console.info = (...args) => {
      // Only allow non-sensitive info logs
      const sanitized = args.map(sanitizeData);
      logger.info('Console', 'Info log', { args: sanitized });
    };
    console.warn = (...args) => {
      const sanitized = args.map(sanitizeData);
      logger.warn('Console', 'Warning', { args: sanitized });
    };
    console.error = (...args) => {
      const sanitized = args.map(sanitizeData);
      logger.error('Console', 'Error', { args: sanitized });
    };
  }
};

/**
 * Initialize production logging safeguards
 */
export const initProductionLogging = () => {
  disableConsoleInProduction();
  
  // Log initialization
  secureLogger.info('Security', 'Production logging initialized');
};