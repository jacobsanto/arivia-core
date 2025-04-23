
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function extractRateLimitInfo(headers: Headers): { rate_limit: number; remaining: number; reset: number } | null {
  try {
    return {
      rate_limit: parseInt(headers.get('x-ratelimit-limit') || '0'),
      remaining: parseInt(headers.get('x-ratelimit-remaining') || '0'),
      reset: parseInt(headers.get('x-ratelimit-reset') || '0')
    };
  } catch (error) {
    console.error('Error extracting rate limit info:', error);
    return null;
  }
}

export function createSuccessResponse(total: number, results: any[], created: number, updated: number, deleted: number, startTime: number) {
  return new Response(
    JSON.stringify({
      success: true,
      message: `Successfully synced ${total} bookings`,
      results,
      bookings_synced: total,
      status: results.some(r => !r.success) ? 'partial' : 'success',
      metrics: {
        created,
        updated,
        deleted,
        time_taken: `${Math.round((Date.now() - startTime) / 1000)}s`
      }
    }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

export function createErrorResponse(error: Error, startTime: number) {
  return new Response(
    JSON.stringify({
      success: false,
      error: error.message,
      time_taken: `${Math.round((Date.now() - startTime) / 1000)}s`
    }),
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}
