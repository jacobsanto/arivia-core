/**
 * Production security utilities
 * Helps ensure security measures are enforced in production builds
 */

/**
 * Check if the current environment is production
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD || process.env.NODE_ENV === 'production';
};

/**
 * Check if the current environment is development
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || process.env.NODE_ENV === 'development';
};

/**
 * Check if current host is localhost or development domain
 */
export const isLocalDevelopment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.endsWith('.local') || 
    hostname.includes('dev') ||
    isDevelopment()
  );
};

/**
 * Secure console logging - only logs in development
 */
export const secureLog = {
  info: (...args: any[]) => {
    if (isDevelopment()) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment()) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment()) {
      console.error(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment()) {
      console.log('[DEBUG]', ...args);
    }
  }
};

/**
 * Validate secure context requirements
 */
export const validateSecureContext = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  // In production, require HTTPS except for localhost
  if (isProduction() && !isLocalDevelopment()) {
    return window.location.protocol === 'https:';
  }
  
  return true;
};