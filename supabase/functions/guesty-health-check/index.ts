
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
    const { data: integrationHealth, error: healthError } = await supabase
      .from('integration_health')
      .select('*')
      .eq('provider', 'guesty')
      .maybeSingle();
      
    if (healthError) {
      console.error('Error fetching integration health:', healthError);
      throw healthError;
    }
    
    // If we couldn't find any health record, create one
    if (!integrationHealth) {
      const { error: insertError } = await supabase
        .from('integration_health')
        .insert({
          provider: 'guesty',
          status: 'not_configured',
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error creating integration health record:', insertError);
        throw insertError;
      }
    }
    
    // Get the most recent API usage records
    const { data: apiUsage, error: apiUsageError } = await supabase
      .from('guesty_api_usage')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);
      
    if (apiUsageError) {
      console.error('Error fetching API usage:', apiUsageError);
      // Continue despite error, we'll just return empty API usage
    }
      
    // Get the most recent sync logs
    const { data: syncLogs, error: syncLogsError } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('service', 'guesty')
      .order('start_time', { ascending: false })
      .limit(5);

    if (syncLogsError) {
      console.error('Error fetching sync logs:', syncLogsError);
      // Continue despite error, we'll just return empty sync logs
    }

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
        const nextRetryDate = new Date(syncLogs[0].next_retry_time);
        if (!isNaN(nextRetryDate.getTime())) {
          nextSyncTime = nextRetryDate.toISOString();
        }
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
      
      // Get duration or calculate it
      let duration = log.sync_duration;
      if (!duration && startTime && endTime) {
        duration = new Date(endTime).getTime() - new Date(startTime).getTime();
      }
      
      return {
        id: log.id,
        status: log.status || "unknown",
        start_time: startTime,
        end_time: endTime,
        duration: duration,
        message: log.message,
        retry_count: log.retry_count || 0,
        next_retry_time: log.next_retry_time && !isNaN(new Date(log.next_retry_time).getTime()) 
          ? new Date(log.next_retry_time).toISOString() 
          : null
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
    
    // If no lastSynced date is available from integration_health, check if we have any listings
    if (!lastSynced) {
      try {
        const { data: listings } = await supabase
          .from('guesty_listings')
          .select('last_synced')
          .order('last_synced', { ascending: false })
          .limit(1);
          
        if (listings && listings.length > 0 && listings[0].last_synced) {
          lastSynced = new Date(listings[0].last_synced).toISOString();
          
          // Update the integration health record with this last_synced value
          await supabase
            .from('integration_health')
            .update({ 
              last_synced: lastSynced,
              status: 'connected' // If we have listings, we're connected
            })
            .eq('provider', 'guesty');
        }
      } catch (error) {
        console.error("Error checking listings for last_synced:", error);
      }
    }
    
    // Determine current status more accurately
    let status = integrationHealth?.status || 'unknown';
    
    // If status is 'error' but we have listings that were synced, the connection is actually working
    if (status === 'error' && lastSynced) {
      // If the last sync was within the last 24 hours, consider the connection "connected"
      const lastSyncedDate = new Date(lastSynced);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      if (lastSyncedDate > oneDayAgo) {
        status = 'connected';
        
        // Update the integration health record
        try {
          await supabase
            .from('integration_health')
            .update({ 
              status: 'connected',
              last_error: null
            })
            .eq('provider', 'guesty');
        } catch (error) {
          console.error("Error updating integration health status:", error);
        }
      }
    }
    
    const healthStatus = {
      status,
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
      error: error.message,
      health: {
        status: 'error',
        lastError: error.message,
        recentSyncs: [],
        quotaUsage: {},
        isRateLimited: false
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
