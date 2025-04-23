
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { createSyncLog } from './sync-log.ts';
import { handleError } from './error-handlers.ts';
import { processListings } from './listing-processor.ts';
import { corsHeaders, calculateBackoff } from './utils.ts';
import { getGuestyToken } from './auth.ts';
import { createRateLimitResponse } from './sync-result-handlers.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Constants
const MAX_RUNTIME_MS = 50000; // 50 seconds
const MAX_RETRIES = 3;
const DELAY_BETWEEN_LISTINGS_MS = 300;

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

    // Get Guesty access token with retry mechanism
    let token;
    try {
      token = await getGuestyToken(MAX_RETRIES);
    } catch (tokenError) {
      console.error('Error getting Guesty token:', tokenError);
      
      // Check if it's a rate limit error
      if (tokenError.message && tokenError.message.includes('Too Many Requests')) {
        return createRateLimitResponse(null, 60000, startTime);
      }
      
      return handleError(tokenError, supabase, syncLog, startTime);
    }

    // Process listings based on request type
    if (listingId) {
      const result = await processListings(
        supabase, token, [listingId], startTime, MAX_RUNTIME_MS
      );
      
      // Use the imported function from sync-result-handlers.ts
      const { createSuccessResponse } = await import('./sync-result-handlers.ts');
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
      const { data: listings, error } = await supabase
        .from('guesty_listings')
        .select('id')
        .eq('is_deleted', false)
        .eq('sync_status', 'active')
        .range(startIndex, startIndex + 19);
        
      if (error) throw new Error(`Failed to fetch listings: ${error.message}`);
      if (!listings?.length) throw new Error('No active listings found to sync');
      
      const result = await processListings(
        supabase, token, listings.map(l => l.id), startTime, MAX_RUNTIME_MS
      );
      
      // Use the imported function from sync-result-handlers.ts
      const { createSuccessResponse } = await import('./sync-result-handlers.ts');
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
    }

  } catch (error) {
    return handleError(error, supabase, syncLog, startTime);
  }
});
