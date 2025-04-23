
export interface RateLimitInfo {
  rate_limit: number;
  remaining: number;
  reset: string | null;
}

export function extractRateLimitInfo(headers: Headers): RateLimitInfo | null {
  try {
    const rateLimit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    
    if (rateLimit && remaining) {
      return {
        rate_limit: parseInt(rateLimit, 10),
        remaining: parseInt(remaining, 10),
        reset: reset
      };
    }
    
    return null;
  } catch (e) {
    console.error('Error extracting rate limit info:', e);
    return null;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
