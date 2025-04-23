
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Creates a delay for the specified amount of milliseconds
 */
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extracts rate limit information from the response headers
 */
export function extractRateLimitInfo(headers: Headers): { 
  rate_limit: number | null, 
  remaining: number | null, 
  reset: number | null 
} {
  const rateLimit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');
  
  return {
    rate_limit: rateLimit ? parseInt(rateLimit, 10) : null,
    remaining: remaining ? parseInt(remaining, 10) : null,
    reset: reset ? parseInt(reset, 10) : null
  };
}

/**
 * Exponential backoff for retrying requests
 */
export function calculateBackoff(retryCount: number, baseDelay = 1000, maxDelay = 60000): number {
  // Exponential backoff with jitter
  const delay = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
  return delay + (Math.random() * 1000); // Add up to 1s of jitter
}

/**
 * Helper for creating a standardized response
 */
export function createResponse(body: any, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
