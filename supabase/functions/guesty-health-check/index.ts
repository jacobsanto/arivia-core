
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
              limit: curr.rate_limit
            };
          }
          acc[curr.endpoint].total++;
          return acc;
        }, {})
      : {};
      
    // Calculate next sync time and ensure it's a valid ISO string
    let nextSyncTime = null;
    if (syncLogs && syncLogs.length > 0 && syncLogs[0].next_retry_time) {
      try {
        nextSyncTime = new Date(syncLogs[0].next_retry_time).toISOString();
      } catch (error) {
        console.error("Invalid next_retry_time format:", syncLogs[0].next_retry_time);
      }
    }
      
    const isRateLimited = integrationHealth?.is_rate_limited || false;
    
    // Process sync logs to ensure all date fields are valid
    const processedSyncLogs = syncLogs?.map(log => {
      // Ensure all date strings are valid
      let startTime = null;
      let endTime = null;
      
      try {
        if (log.start_time) {
          startTime = new Date(log.start_time).toISOString();
        }
      } catch (e) {
        console.error("Invalid start_time:", log.start_time);
      }
      
      try {
        if (log.end_time) {
          endTime = new Date(log.end_time).toISOString();
        }
      } catch (e) {
        console.error("Invalid end_time:", log.end_time);
      }
      
      return {
        id: log.id,
        status: log.status,
        start_time: startTime,
        end_time: endTime,
        duration: log.sync_duration,
        message: log.message,
        retry_count: log.retry_count,
        next_retry_time: log.next_retry_time ? new Date(log.next_retry_time).toISOString() : null
      };
    }).filter(log => log.start_time !== null) || [];
    
    // Ensure lastSynced is a valid date
    let lastSynced = null;
    if (integrationHealth?.last_synced) {
      try {
        lastSynced = new Date(integrationHealth.last_synced).toISOString();
      } catch (error) {
        console.error("Invalid last_synced format:", integrationHealth.last_synced);
      }
    }
    
    const healthStatus = {
      status: integrationHealth?.status || 'unknown',
      lastSynced,
      lastError: integrationHealth?.last_error || null,
      isRateLimited,
      remainingRequests: integrationHealth?.remaining_requests,
      nextSyncTime,
      quotaUsage,
      recentSyncs: processedSyncLogs
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
