
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
    const rate_limit = parseInt(headers.get('x-ratelimit-limit') || '0');
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || '0');
    
    // Try to parse reset as timestamp, or fall back to calculating from expire-after
    let reset: string;
    const resetHeader = headers.get('x-ratelimit-reset');
    if (resetHeader) {
      reset = resetHeader;
    } else {
      // If no reset header, try to calculate from expire-after (seconds)
      const expireAfter = parseInt(headers.get('x-ratelimit-expire-after') || '3600');
      reset = new Date(Date.now() + expireAfter * 1000).toISOString();
    }
    
    if (rate_limit === 0) return null;
    
    return {
      rate_limit,
      remaining,
      reset
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
