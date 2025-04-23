
import { corsHeaders } from './utils.ts';
import { updateSyncLog } from './sync-log.ts';

export async function createSuccessResponse(
  bookingsSynced: number,
  results: any[],
  created: number,
  updated: number,
  deleted: number,
  startTime: number,
  syncLog?: any,
  supabase?: any
) {
  const processedCount = results.length;
  const failures = results.filter(r => !r.success).length;
  const successCount = processedCount - failures;
  
  // Update sync log if provided
  if (syncLog?.id && supabase) {
    await updateSyncLog(supabase, syncLog.id, {
      status: failures > 0 ? 'partial' : 'completed', 
      end_time: new Date().toISOString(),
      message: `Synced ${bookingsSynced} bookings across ${processedCount} listings (${failures} failures)`,
      entities_synced: bookingsSynced,
      sync_duration_ms: Date.now() - startTime
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Booking sync completed in ${Math.round((Date.now() - startTime) / 1000)}s`,
      processedCount,
      bookingsSynced,
      created,
      updated,
      deleted,
      failures,
      duration_ms: Date.now() - startTime,
      results: results.map(r => ({ 
        listingId: r.listingId, 
        success: r.success, 
        bookingsCount: r.bookingsCount || 0,
        error: r.error || null 
      }))
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export async function createErrorResponse(
  error: any, 
  startTime: number,
  status = 500
) {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Error during booking sync',
      error: error instanceof Error ? error.message : String(error),
      duration_ms: Date.now() - startTime
    }),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export async function createRateLimitResponse(
  reset: number | null,
  retryAfter: number,
  startTime: number
) {
  // Calculate a retry-after based on rate limit reset or default to provided value
  const retrySeconds = reset ? (reset - Math.floor(Date.now() / 1000)) : Math.ceil(retryAfter / 1000);
  const retryMessage = reset 
    ? `Rate limit exceeded. Try again in ${retrySeconds} seconds.`
    : `Too many requests. Try again in ${retrySeconds} seconds.`;
    
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'Retry-After': String(retrySeconds)
  };
  
  return new Response(
    JSON.stringify({
      success: false,
      message: retryMessage,
      retryAfter: retrySeconds,
      duration_ms: Date.now() - startTime
    }),
    { status: 429, headers }
  );
}
