import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getGuestyToken } from './auth.ts';
import { syncGuestyListings } from './listings.ts';
import { syncGuestyBookingsForListing } from './bookings.ts';
import { RateLimitInfo } from './utils.ts';
import { updateSyncLogError, updateSyncLogSuccess, createSyncLog } from './sync-log.ts';
import { updateIntegrationHealth, storeRateLimitInfo } from './integration-health.ts';
import { checkSyncCooldown } from './cooldown.ts';
import { orchestrateFullSync } from './syncService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let syncLog;
  let supabase: any;

  try {
    console.log('Starting guesty-sync function');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(JSON.stringify({
        success: false,
        message: 'Server configuration error: Missing required environment variables'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created successfully');

    const syncResult = await orchestrateFullSync({ supabase, syncLog, startTime });
    return new Response(JSON.stringify(syncResult.response), {
      status: syncResult.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected sync error:', error);
    
    const isRateLimit = errorMessage.includes('Too Many Requests') || errorMessage.includes('429');

    if (syncLog?.id && supabase) {
      await updateSyncLogError(
        supabase, 
        syncLog.id, 
        errorMessage, 
        startTime, 
        isRateLimit ? (syncLog.retry_count || 0) + 1 : syncLog.retry_count || 0
      );
    }

    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await updateIntegrationHealth(
        supabase, 
        'error', 
        null, 
        null, 
        errorMessage
      );
    } catch (err) {
      console.error('Error updating integration health for failed sync:', err);
    }

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      isRateLimit: isRateLimit
    }), {
      status: isRateLimit ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
