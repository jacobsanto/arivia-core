/**
 * Profile refresh rate limiting service
 * Prevents excessive profile refresh calls that cause API throttling
 */

import { logger } from './logger';

interface ProfileRefreshEntry {
  lastRefreshTime: number;
  refreshCount: number;
  isThrottled: boolean;
}

class ProfileRefreshLimiter {
  private userRefreshMap = new Map<string, ProfileRefreshEntry>();
  private readonly REFRESH_COOLDOWN = 2 * 60 * 1000; // 2 minutes
  private readonly MAX_REFRESH_PER_HOUR = 10; // Maximum refreshes per hour
  private readonly THROTTLE_DURATION = 5 * 60 * 1000; // 5 minutes throttle
  private readonly HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds

  canRefresh(userId: string): boolean {
    const now = Date.now();
    const entry = this.userRefreshMap.get(userId);

    if (!entry) {
      // First refresh for this user
      this.userRefreshMap.set(userId, {
        lastRefreshTime: now,
        refreshCount: 1,
        isThrottled: false
      });
      return true;
    }

    // Check if user is currently throttled
    if (entry.isThrottled && now - entry.lastRefreshTime < this.THROTTLE_DURATION) {
      logger.warn('Profile refresh blocked - user is throttled', { 
        userId, 
        remainingTime: this.THROTTLE_DURATION - (now - entry.lastRefreshTime) 
      });
      return false;
    }

    // Reset throttle if enough time has passed
    if (entry.isThrottled && now - entry.lastRefreshTime >= this.THROTTLE_DURATION) {
      entry.isThrottled = false;
      entry.refreshCount = 0;
    }

    // Check cooldown period
    if (now - entry.lastRefreshTime < this.REFRESH_COOLDOWN) {
      logger.debug('Profile refresh blocked - cooldown period', { 
        userId, 
        remainingTime: this.REFRESH_COOLDOWN - (now - entry.lastRefreshTime) 
      });
      return false;
    }

    // Reset hourly counter if more than an hour has passed
    if (now - entry.lastRefreshTime > this.HOUR_MS) {
      entry.refreshCount = 0;
    }

    // Check hourly limit
    if (entry.refreshCount >= this.MAX_REFRESH_PER_HOUR) {
      logger.warn('Profile refresh blocked - hourly limit exceeded', { 
        userId, 
        refreshCount: entry.refreshCount 
      });
      entry.isThrottled = true;
      entry.lastRefreshTime = now;
      return false;
    }

    // Allow refresh and update counters
    entry.lastRefreshTime = now;
    entry.refreshCount += 1;
    
    logger.debug('Profile refresh allowed', { 
      userId, 
      refreshCount: entry.refreshCount 
    });
    
    return true;
  }

  recordRefresh(userId: string): void {
    const now = Date.now();
    const entry = this.userRefreshMap.get(userId);

    if (entry) {
      entry.lastRefreshTime = now;
      entry.refreshCount += 1;
    } else {
      this.userRefreshMap.set(userId, {
        lastRefreshTime: now,
        refreshCount: 1,
        isThrottled: false
      });
    }
  }

  forceAllowRefresh(userId: string): void {
    const entry = this.userRefreshMap.get(userId);
    if (entry) {
      entry.isThrottled = false;
      entry.refreshCount = 0;
      logger.debug('Profile refresh force-allowed', { userId });
    }
  }

  getRefreshStatus(userId: string): {
    canRefresh: boolean;
    refreshCount: number;
    lastRefreshTime: number;
    isThrottled: boolean;
    nextAllowedTime?: number;
  } {
    const entry = this.userRefreshMap.get(userId);
    const now = Date.now();

    if (!entry) {
      return {
        canRefresh: true,
        refreshCount: 0,
        lastRefreshTime: 0,
        isThrottled: false
      };
    }

    const canRefresh = this.canRefresh(userId);
    let nextAllowedTime: number | undefined;

    if (!canRefresh) {
      if (entry.isThrottled) {
        nextAllowedTime = entry.lastRefreshTime + this.THROTTLE_DURATION;
      } else {
        nextAllowedTime = entry.lastRefreshTime + this.REFRESH_COOLDOWN;
      }
    }

    return {
      canRefresh,
      refreshCount: entry.refreshCount,
      lastRefreshTime: entry.lastRefreshTime,
      isThrottled: entry.isThrottled,
      nextAllowedTime
    };
  }

  cleanupOldEntries(): void {
    const now = Date.now();
    const cutoffTime = now - (2 * this.HOUR_MS); // Clean up entries older than 2 hours
    
    let cleanedCount = 0;
    this.userRefreshMap.forEach((entry, userId) => {
      if (entry.lastRefreshTime < cutoffTime) {
        this.userRefreshMap.delete(userId);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      logger.debug('Cleaned up old profile refresh entries', { count: cleanedCount });
    }
  }

  getStats(): {
    totalUsers: number;
    throttledUsers: number;
    averageRefreshCount: number;
  } {
    const entries = Array.from(this.userRefreshMap.values());
    const throttledCount = entries.filter(e => e.isThrottled).length;
    const avgRefreshCount = entries.length > 0 
      ? entries.reduce((sum, e) => sum + e.refreshCount, 0) / entries.length 
      : 0;

    return {
      totalUsers: entries.length,
      throttledUsers: throttledCount,
      averageRefreshCount: Math.round(avgRefreshCount * 100) / 100
    };
  }
}

export const profileRefreshLimiter = new ProfileRefreshLimiter();

// Set up periodic cleanup
setInterval(() => {
  profileRefreshLimiter.cleanupOldEntries();
}, 30 * 60 * 1000); // Clean up every 30 minutes