
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface RateLimitInfo {
  rate_limit: number;
  remaining: number;
  reset: string;
}

export function extractRateLimitInfo(headers: Headers): RateLimitInfo | null {
  const rateLimit = headers.get('X-RateLimit-Limit');
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');
  
  if (!rateLimit || !remaining || !reset) {
    return null;
  }
  
  return {
    rate_limit: parseInt(rateLimit, 10),
    remaining: parseInt(remaining, 10),
    reset
  };
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
