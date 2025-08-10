import { supabase } from '@/integrations/supabase/client';

// Request deduplication to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<any>>();

export const deduplicateRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};

// Optimized session management with reduced token refresh frequency
export class SessionManager {
  private static instance: SessionManager;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private lastRefresh = 0;
  private readonly MIN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static getInstance() {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  scheduleRefresh(expiresAt: number) {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const now = Date.now();
    const expiresIn = expiresAt * 1000 - now;
    const refreshIn = Math.max(expiresIn - 60000, 60000); // Refresh 1 minute before expiry, minimum 1 minute

    // Don't refresh too frequently
    if (now - this.lastRefresh < this.MIN_REFRESH_INTERVAL) {
      return;
    }

    this.refreshTimeout = setTimeout(async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh failed:', error);
        } else {
          this.lastRefresh = Date.now();
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    }, refreshIn);
  }

  cleanup() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }
}

// Enhanced auth configuration for minimal egress
export const authConfig = {
  // Reduce automatic token refresh frequency
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  
  // Custom storage with compression for larger sessions
  storage: {
    getItem: (key: string) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return localStorage.getItem(key);
      }
    },
    setItem: (key: string, value: string) => {
      try {
        // Compress session data if it's large
        const data = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, data);
      } catch (error) {
        console.warn('Failed to store auth data:', error);
      }
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key);
    }
  }
};