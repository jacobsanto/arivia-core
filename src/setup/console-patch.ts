// Patch console to route through centralized logger in production
import { logger } from '@/services/logger';

// Only patch in production to keep DX in dev
const isProd = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;

if (typeof window !== 'undefined') {
  const w = window as any;
  // Capture originals once and expose for logger to avoid recursion
  const originalLog = console.log.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);
  w.__ORIGINAL_CONSOLE = { log: originalLog, warn: originalWarn, error: originalError };

  if (isProd) {
    console.log = (...args: any[]) => {
      try {
        // Security: Only log non-sensitive data in production
        const sanitizedArgs = args.map(arg => 
          typeof arg === 'object' && arg !== null ? '[Object]' : String(arg)
        );
        logger.info('console.log', 'message', { count: args.length });
      } catch {}
      // Suppress all console.log output in production
    };

    console.warn = (...args: any[]) => {
      try {
        logger.warn('console.warn', 'warning', { count: args.length });
      } catch {}
      // Suppress warnings in production unless critical
    };

    console.error = (...args: any[]) => {
      try {
        // Security: Sanitize error messages to prevent data exposure
        const sanitizedArgs = args.map(arg => 
          typeof arg === 'string' ? arg.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]') : '[Error Object]'
        );
        logger.error('console.error', 'error', { count: args.length });
      } catch {}
      // Still forward sanitized errors to original for visibility
      const sanitizedError = args.map(arg => 
        typeof arg === 'string' ? arg.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]') : '[Error]'
      );
      originalError(...sanitizedError);
    };
  }
}
