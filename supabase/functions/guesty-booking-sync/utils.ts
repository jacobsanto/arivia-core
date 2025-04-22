
// Types for rate limit information
export interface RateLimitInfo {
  rate_limit: number;
  remaining: number;
  reset: string; // ISO string timestamp
}

// Extract rate limit information from Guesty API response headers
export function extractRateLimitInfo(headers: Headers): RateLimitInfo | null {
  try {
    const rate_limit = parseInt(headers.get('x-ratelimit-limit') || '0');
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || '0');
    const reset = headers.get('x-ratelimit-reset') || new Date(Date.now() + 3600000).toISOString();
    
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
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
