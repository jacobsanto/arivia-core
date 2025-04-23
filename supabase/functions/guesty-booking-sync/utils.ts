
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
  reset: number | null,
  endpoint?: string,
  method?: string,
  status?: number
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

/**
 * Logs API usage to the database
 */
export async function logApiUsage(
  supabase: any,
  endpoint: string,
  method: string = 'GET',
  status: number = 200,
  rateLimitInfo: any = null,
  listingId: string | null = null
) {
  try {
    const apiUsageData = {
      endpoint,
      method,
      status,
      listing_id: listingId,
      timestamp: new Date().toISOString(),
      rate_limit: rateLimitInfo?.rate_limit || null,
      remaining: rateLimitInfo?.remaining || null,
      reset: rateLimitInfo?.reset ? new Date(rateLimitInfo.reset * 1000).toISOString() : null
    };

    const { error } = await supabase
      .from('guesty_api_usage')
      .insert(apiUsageData);
      
    if (error) {
      console.error('[API Usage] Failed to log API usage:', error);
    }
  } catch (err) {
    console.error('[API Usage] Exception logging API usage:', err);
  }
}
