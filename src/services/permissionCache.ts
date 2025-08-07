/**
 * Permission caching service to reduce excessive API calls
 * Implements a 5-minute cache for permission checks
 */

import { logger } from './logger';

interface PermissionCacheEntry {
  permissions: Record<string, boolean>;
  timestamp: number;
  userRole: string;
  userId: string;
}

class PermissionCacheService {
  private cache = new Map<string, PermissionCacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100; // Prevent memory leaks

  private generateCacheKey(userId: string, userRole: string): string {
    return `${userId}-${userRole}`;
  }

  get(userId: string, userRole: string): Record<string, boolean> | null {
    const key = this.generateCacheKey(userId, userRole);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      logger.debug('Permission cache expired', { userId, userRole });
      return null;
    }

    logger.debug('Permission cache hit', { userId, userRole });
    return entry.permissions;
  }

  set(userId: string, userRole: string, permissions: Record<string, boolean>): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.clearExpired();
      
      // If still too large, clear oldest entries
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const entries = Array.from(this.cache.entries());
        entries
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, Math.floor(this.MAX_CACHE_SIZE / 2))
          .forEach(([key]) => this.cache.delete(key));
      }
    }

    const key = this.generateCacheKey(userId, userRole);
    this.cache.set(key, {
      permissions,
      timestamp: Date.now(),
      userRole,
      userId
    });

    logger.debug('Permission cache set', { userId, userRole, cacheSize: this.cache.size });
  }

  invalidate(userId: string, userRole?: string): void {
    if (userRole) {
      const key = this.generateCacheKey(userId, userRole);
      this.cache.delete(key);
      logger.debug('Permission cache invalidated', { userId, userRole });
    } else {
      // Invalidate all entries for this user
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(userId));
      keysToDelete.forEach(key => this.cache.delete(key));
      logger.debug('Permission cache invalidated for user', { userId, keysCleared: keysToDelete.length });
    }
  }

  private clearExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      logger.debug('Cleared expired permission cache entries', { count: expiredKeys.length });
    }
  }

  clear(): void {
    this.cache.clear();
    logger.debug('Permission cache cleared');
  }

  getStats(): { size: number; entries: Array<{ userId: string; userRole: string; age: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      userId: entry.userId,
      userRole: entry.userRole,
      age: now - entry.timestamp
    }));

    return {
      size: this.cache.size,
      entries
    };
  }
}

export const permissionCache = new PermissionCacheService();