
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the latest integration health record
    const { data: integrationHealth, error } = await supabase
      .from('integration_health')
      .select('*')
      .eq('provider', 'guesty')
      .maybeSingle();
      
    if (error) throw error;
    
    // Get the most recent API usage records
    const { data: apiUsage } = await supabase
      .from('guesty_api_usage')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);
      
    // Get the most recent sync logs
    const { data: syncLogs } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('service', 'guesty')
      .order('start_time', { ascending: false })
      .limit(5);

    // Calculate quota usage
    const quotaUsage = apiUsage 
      ? apiUsage.reduce((acc, curr) => {
          if (!acc[curr.endpoint]) {
            acc[curr.endpoint] = {
              total: 0,
              remaining: curr.remaining,
              limit: curr.limit
            };
          }
          acc[curr.endpoint].total++;
          return acc;
        }, {})
      : {};
      
    // Calculate next sync time
    const nextSyncTime = syncLogs && syncLogs.length > 0 && syncLogs[0].next_retry_time
      ? new Date(syncLogs[0].next_retry_time)
      : null;
      
    const isRateLimited = integrationHealth?.is_rate_limited || false;
    
    const healthStatus = {
      status: integrationHealth?.status || 'unknown',
      lastSynced: integrationHealth?.last_synced || null,
      lastError: integrationHealth?.last_error || null,
      isRateLimited,
      remainingRequests: integrationHealth?.remaining_requests,
      nextSyncTime: nextSyncTime?.toISOString(),
      quotaUsage,
      recentSyncs: syncLogs?.map(log => ({
        id: log.id,
        status: log.status,
        startTime: log.start_time,
        endTime: log.end_time,
        duration: log.sync_duration,
        message: log.message,
        retryCount: log.retry_count
      }))
    };
    
    return new Response(JSON.stringify({
      success: true,
      health: healthStatus
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
