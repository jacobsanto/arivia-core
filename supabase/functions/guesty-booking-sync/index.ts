import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { createSyncLog, updateSyncLog } from './sync-log.ts';
import { handleError } from './error-handlers.ts';
import { corsHeaders, calculateBackoff, delay } from './utils.ts';
import { getGuestyToken } from './auth.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Constants
const MAX_RUNTIME_MS = 50000; // 50 seconds
const MAX_RETRIES = 3;
const MAX_LISTINGS_PER_RUN = 25; // Limit listings per function call

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  let syncLog = null;

  try {
    // Create initial sync log entry
    syncLog = await createSyncLog(supabase, {
      provider: 'guesty',
      sync_type: 'bookings',
      status: 'in_progress',
      start_time: new Date().toISOString(),
      message: 'Starting booking sync process'
    });

    // Parse request body
    let requestBody = {};
    try {
      requestBody = await req.json();
    } catch (e) {
      console.warn('Failed to parse request body, using empty object', e);
    }
    
    const { listingId, syncAll, startIndex = 0, totalListings = 0 } = requestBody as any;

    // Check if API calls have been rate limited recently
    const { data: recentRateLimits } = await supabase
      .from('guesty_api_usage')
      .select('timestamp')
      .eq('status', 429)
      .gte('timestamp', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
      .order('timestamp', { ascending: false });
      
    if (recentRateLimits?.length && recentRateLimits.length > 3) {
      console.warn(`[RATE LIMIT PROTECTION] Detected ${recentRateLimits.length} rate limit errors in the last 10 minutes. Enforcing cooldown.`);
      
      // Update sync log with cooldown message
      await updateSyncLog(supabase, syncLog.id, {
        status: 'error',
        end_time: new Date().toISOString(),
        sync_duration_ms: Date.now() - startTime,
        message: `Sync aborted due to rate limit protection. Detected ${recentRateLimits.length} rate limits in the last 10 minutes.`,
        retry_count: 0,
        next_retry_time: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min cooldown
      });
      
      // Return a clear response about the rate limit protection
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit protection activated',
          rate_limited: true,
          cooldown_minutes: 15,
          rate_limit_count: recentRateLimits.length,
          retry_after: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutes in seconds
          }
        }
      );
    }

    // Get Guesty access token with retry mechanism
    let token;
    try {
      token = await getGuestyToken(MAX_RETRIES);
    } catch (tokenError) {
      console.error('Error getting Guesty token:', tokenError);
      
      // Check if it's a rate limit error
      if (tokenError.message && tokenError.message.includes('Too Many Requests')) {
        // Log the rate limit to guesty_api_usage
        try {
          await supabase.from('guesty_api_usage').insert({
            endpoint: '/oauth2/token',
            method: 'POST',
            status: 429,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.error('Failed to log rate limit for token:', e);
        }
        
        // Use the imported function from sync-result-handlers.ts
        const { createRateLimitResponse } = await import('./sync-result-handlers.ts');
        return createRateLimitResponse(null, 60000, startTime);
      }
      
      return handleError(tokenError, supabase, syncLog, startTime);
    }

    // Import necessary modules
    const { processListings } = await import('./listing-processor.ts');
    const { createSuccessResponse } = await import('./sync-result-handlers.ts');
    
    // Process listings based on request type
    if (listingId) {
      const result = await processListings(
        supabase, token, [listingId], startTime, MAX_RUNTIME_MS
      );
      
      return createSuccessResponse(
        result.totalBookingsSynced,
        result.results,
        result.created,
        result.updated,
        result.deleted,
        startTime,
        syncLog,
        supabase
      );
    } else {
      // Fetch active listings with pagination
      const { data: listings, error } = await supabase
        .from('guesty_listings')
        .select('id')
        .eq('is_deleted', false)
        .eq('sync_status', 'active')
        .range(startIndex, startIndex + MAX_LISTINGS_PER_RUN - 1); // Limit batch size
        
      if (error) throw new Error(`Failed to fetch listings: ${error.message}`);
      if (!listings?.length) throw new Error('No active listings found to sync');
      
      // Log that we're limiting the batch
      if (listings.length < MAX_LISTINGS_PER_RUN) {
        console.log(`Processing all ${listings.length} available listings`);
      } else {
        console.log(`Processing ${listings.length} out of potentially more listings (batch limit: ${MAX_LISTINGS_PER_RUN})`);
      }
      
      const result = await processListings(
        supabase, token, listings.map(l => l.id), startTime, MAX_RUNTIME_MS
      );
      
      // Check if we might have more listings
      const moreListingsToProcess = startIndex + MAX_LISTINGS_PER_RUN < totalListings;
      const response = await createSuccessResponse(
        result.totalBookingsSynced,
        result.results,
        result.created,
        result.updated,
        result.deleted,
        startTime,
        syncLog,
        supabase
      );
      
      // Add information about pagination to the response
      const responseBody = await response.json();
      return new Response(
        JSON.stringify({
          ...responseBody,
          processedCount: listings.length,
          moreListingsToProcess,
          nextStartIndex: startIndex + listings.length
        }),
        response
      );
    }

  } catch (error) {
    return handleError(error, supabase, syncLog, startTime);
  }
});
