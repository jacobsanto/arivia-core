
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch webhook health
    const { data: health, error: healthError } = await supabase
      .from('webhook_health')
      .select('*')
      .eq('provider', 'guesty')
      .single();

    // Fetch integration health
    const { data: integrationHealth, error: integrationError } = await supabase
      .from('integration_health')
      .select('*')
      .eq('provider', 'guesty')
      .single();

    if (healthError || integrationError) {
      console.error('Error fetching health data:', healthError || integrationError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not retrieve health information'
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Determine status and detailed response
    const status = health?.status || 'disconnected';
    const isConnected = status === 'connected' || status === 'received';

    return new Response(JSON.stringify({
      success: true,
      health: {
        status,
        lastSynced: integrationHealth?.last_synced,
        lastBookingsSynced: integrationHealth?.last_bookings_synced,
        lastError: health?.last_error,
        isRateLimited: integrationHealth?.is_rate_limited || false,
        remainingRequests: integrationHealth?.remaining_requests,
        nextSyncTime: health?.next_sync_time,
        reconnectAttempts: health?.reconnect_attempts,
      }
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Unexpected error in health check:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Unexpected error during health check'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
