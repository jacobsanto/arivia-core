/**
 * Centralized API client with error handling, retries, and caching
 */
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger";

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error' | 'loading';
}

export interface ApiOptions {
  retries?: number;
  timeout?: number;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

class ApiClient {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  async query<T>(
    table: string,
    query: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const { retries = 3, timeout = 10000, cache = false, cacheKey, cacheTTL = 300000 } = options;
    
    // Check cache first
    if (cache && cacheKey) {
      const cached = this.getCached(cacheKey);
      if (cached) {
        logger.debug('ApiClient cache hit', { cacheKey });
        return { data: cached, error: null, status: 'success' };
      }
    }
    
    let lastError: any;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        logger.debug('ApiClient query attempt', { table, attempt: attempt + 1 });
        
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        );
        
        const queryPromise = query.then((result: any) => {
          if (result.error) throw result.error;
          return result;
        });
        
        const result = await Promise.race([queryPromise, timeoutPromise]);
        
        // Cache successful results
        if (cache && cacheKey && result.data) {
          this.setCache(cacheKey, result.data, cacheTTL);
        }
        
        logger.debug('ApiClient query success', { table });
        return { data: result.data, error: null, status: 'success' };
        
      } catch (error: any) {
        lastError = error;
        logger.warn('ApiClient query attempt failed', { 
          table, 
          attempt: attempt + 1, 
          error: error.message 
        });
        
        // Don't retry on authentication errors
        if (error.message?.includes('JWT') || error.code === 'PGRST301') {
          break;
        }
        
        // Exponential backoff
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    logger.error('ApiClient query failed', { table, error: lastError?.message });
    return { 
      data: null, 
      error: lastError?.message || 'Request failed', 
      status: 'error' 
    };
  }
  
  async mutate<T>(
    operation: () => Promise<any>,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const { retries = 1 } = options;
    
    let lastError: any;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        logger.debug('ApiClient mutation attempt', { attempt: attempt + 1 });
        
        const result = await operation();
        
        if (result.error) throw result.error;
        
        logger.debug('ApiClient mutation success');
        return { data: result.data, error: null, status: 'success' };
        
      } catch (error: any) {
        lastError = error;
        logger.warn('ApiClient mutation attempt failed', { 
          attempt: attempt + 1, 
          error: error.message 
        });
        
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    logger.error('ApiClient mutation failed', { error: lastError?.message });
    return { 
      data: null, 
      error: lastError?.message || 'Mutation failed', 
      status: 'error' 
    };
  }
  
  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Cleanup old cache entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }
  
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiClient = new ApiClient();