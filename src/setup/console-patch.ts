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
        logger.info('console.log', 'message', { args });
      } catch {}
      // suppress noisy logs in prod
    };

    console.warn = (...args: any[]) => {
      try {
        logger.warn('console.warn', 'warning', { args });
      } catch {}
    };

    console.error = (...args: any[]) => {
      try {
        logger.error('console.error', 'error', { args });
      } catch {}
      // Still forward to original for visibility in hosting logs
      originalError(...args);
    };
  }
}
