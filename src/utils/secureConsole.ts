/**
 * Secure console utilities for production safety
 * Prevents logging sensitive information in production builds
 */

const isProduction = (): boolean => {
  return import.meta.env.PROD || process.env.NODE_ENV === 'production';
};

/**
 * Production-safe console replacement
 * Only logs in development, silent in production
 */
export const secureConsole = {
  log: (...args: any[]) => {
    if (!isProduction()) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!isProduction()) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (!isProduction()) {
      console.error(...args);
    }
  },
  info: (...args: any[]) => {
    if (!isProduction()) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (!isProduction()) {
      console.debug(...args);
    }
  }
};

/**
 * Remove all console statements from production builds
 * This function can be used to strip console logs during build
 */
export const stripConsoleInProduction = () => {
  if (isProduction()) {
    const noop = () => {};
    console.log = noop;
    console.warn = noop;
    console.info = noop;
    console.debug = noop;
    // Keep console.error for critical errors that need to be visible
  }
};
