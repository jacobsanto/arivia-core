
// Types for rate limit information
export interface RateLimitInfo {
  rate_limit: number;
  limit?: number;
  remaining: number;
  reset: string; // ISO string timestamp
}

export type SyncStatus = 'in_progress' | 'completed' | 'error';

// Calculate the next retry time using an exponential backoff strategy
export function calculateNextRetryTime(retryCount: number): number {
  // Base cooldown of 15 minutes
  const baseCooldown = 15;

  // Calculate exponential backoff with a maximum of 4 hours (240 minutes)
  const backoffTime = Math.min(
    baseCooldown * Math.pow(2, retryCount),
    240
  );

  return Math.floor(backoffTime);
}

// Extract rate limit information from Guesty API response headers
export function extractRateLimitInfo(headers: Headers): RateLimitInfo | null {
  try {
    // Use 'x-ratelimit-limit' for both legacy and new API
    const limitHeader = headers.get('x-ratelimit-limit');
    const rate_limit = limitHeader ? parseInt(limitHeader) : 0;
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || '0');
    let resetString = headers.get('x-ratelimit-reset');
    // If reset header is missing, try 'x-ratelimit-expire-after' (in seconds), fallback to 1 hour
    if (!resetString) {
      const expireAfter = parseInt(headers.get('x-ratelimit-expire-after') || '3600');
      resetString = new Date(Date.now() + expireAfter * 1000).toISOString();
    }
    if (rate_limit === 0) return null;

    return {
      rate_limit,
      limit: rate_limit, // For compatibility; can be extended if API adds daily quotas
      remaining,
      reset: resetString || new Date(Date.now() + 3600000).toISOString()
    };
  } catch (error) {
    console.error('Error extracting rate limit info:', error);
    return null;
  }
}

// Delay execution for a specified time (in milliseconds)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
