// Patch console to route through centralized logger in production
import { logger } from '@/services/logger';

// Only patch in production to keep DX in dev
const isProd = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;

if (isProd && typeof window !== 'undefined') {
  const originalLog = console.log.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);

  console.log = (...args: any[]) => {
    try {
      logger.info('console.log', 'message', { args });
    } catch {
    }
    // Do not spam production console
  };

  console.warn = (...args: any[]) => {
    try {
      logger.warn('console.warn', 'warning', { args });
    } catch {
    }
  };

  console.error = (...args: any[]) => {
    try {
      logger.error('console.error', 'error', { args });
    } catch {
    }
    // Still forward to original for visibility in hosting logs
    originalError(...args);
  };
}
