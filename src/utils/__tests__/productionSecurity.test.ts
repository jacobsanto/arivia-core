import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  isProduction, 
  isDevelopment, 
  isLocalDevelopment, 
  secureLog,
  validateSecureContext 
} from '../productionSecurity';

describe('Production Security Utils', () => {
  const originalEnv = import.meta.env;
  const originalLocation = global.location;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    });
    global.location = originalLocation;
  });

  describe('isProduction', () => {
    it('returns true when PROD is true', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, PROD: true },
        writable: true,
      });
      
      expect(isProduction()).toBe(true);
    });

    it('returns false when PROD is false', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, PROD: false },
        writable: true,
      });
      
      expect(isProduction()).toBe(false);
    });
  });

  describe('isDevelopment', () => {
    it('returns true when DEV is true', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, DEV: true },
        writable: true,
      });
      
      expect(isDevelopment()).toBe(true);
    });

    it('returns false when DEV is false', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, DEV: false },
        writable: true,
      });
      
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isLocalDevelopment', () => {
    beforeEach(() => {
      // Mock window.location
      delete (global as any).window;
      (global as any).window = {
        location: {
          hostname: 'localhost'
        }
      };
    });

    it('returns true for localhost', () => {
      (global as any).window.location.hostname = 'localhost';
      expect(isLocalDevelopment()).toBe(true);
    });

    it('returns true for 127.0.0.1', () => {
      (global as any).window.location.hostname = '127.0.0.1';
      expect(isLocalDevelopment()).toBe(true);
    });

    it('returns true for .local domains', () => {
      (global as any).window.location.hostname = 'myapp.local';
      expect(isLocalDevelopment()).toBe(true);
    });

    it('returns true for dev domains', () => {
      (global as any).window.location.hostname = 'myapp.dev.example.com';
      expect(isLocalDevelopment()).toBe(true);
    });

    it('returns false for production domains', () => {
      (global as any).window.location.hostname = 'myapp.com';
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, DEV: false },
        writable: true,
      });
      expect(isLocalDevelopment()).toBe(false);
    });

    it('returns false when window is undefined', () => {
      delete (global as any).window;
      expect(isLocalDevelopment()).toBe(false);
    });
  });

  describe('secureLog', () => {
    beforeEach(() => {
      vi.spyOn(console, 'info').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('logs in development mode', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, DEV: true },
        writable: true,
      });

      secureLog.info('test message');
      secureLog.warn('test warning');
      secureLog.error('test error');
      secureLog.debug('test debug');

      expect(console.info).toHaveBeenCalledWith('test message');
      expect(console.warn).toHaveBeenCalledWith('test warning');
      expect(console.error).toHaveBeenCalledWith('test error');
      expect(console.log).toHaveBeenCalledWith('[DEBUG]', 'test debug');
    });

    it('does not log in production mode', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, DEV: false },
        writable: true,
      });

      secureLog.info('test message');
      secureLog.warn('test warning');
      secureLog.error('test error');
      secureLog.debug('test debug');

      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('validateSecureContext', () => {
    beforeEach(() => {
      delete (global as any).window;
      (global as any).window = {
        location: {
          protocol: 'https:',
          hostname: 'myapp.com'
        }
      };
    });

    it('returns true when window is undefined (SSR)', () => {
      delete (global as any).window;
      expect(validateSecureContext()).toBe(true);
    });

    it('returns true for HTTPS in production', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, PROD: true },
        writable: true,
      });
      
      (global as any).window.location.protocol = 'https:';
      (global as any).window.location.hostname = 'myapp.com';
      
      expect(validateSecureContext()).toBe(true);
    });

    it('returns false for HTTP in production (non-localhost)', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, PROD: true },
        writable: true,
      });
      
      (global as any).window.location.protocol = 'http:';
      (global as any).window.location.hostname = 'myapp.com';
      
      expect(validateSecureContext()).toBe(false);
    });

    it('returns true for HTTP on localhost in production', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, PROD: true },
        writable: true,
      });
      
      (global as any).window.location.protocol = 'http:';
      (global as any).window.location.hostname = 'localhost';
      
      expect(validateSecureContext()).toBe(true);
    });

    it('returns true in development regardless of protocol', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, PROD: false },
        writable: true,
      });
      
      (global as any).window.location.protocol = 'http:';
      (global as any).window.location.hostname = 'myapp.com';
      
      expect(validateSecureContext()).toBe(true);
    });
  });
});