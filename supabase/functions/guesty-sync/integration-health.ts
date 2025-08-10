
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { RateLimitInfo } from './utils.ts';

// Update integration health status after successful sync
export async function updateIntegrationHealth(
  supabase: any, 
  status: 'connected' | 'error',
  rateLimitInfo: RateLimitInfo | null,
  integrationHealth: any,
  errorMessage?: string
): Promise<void> {
  try {
    const updateData: any = {
      provider: 'guesty',
      status: status,
      updated_at: new Date().toISOString(),
      request_count: (integrationHealth?.request_count || 0) + 1
    };
    
    if (status === 'connected') {
      updateData.last_synced = new Date().toISOString();
      updateData.last_error = null;
      
      if (rateLimitInfo) {
        updateData.remaining_requests = rateLimitInfo.remaining;
        updateData.rate_limit_reset = rateLimitInfo.reset;
      }
    } else if (status === 'error' && errorMessage) {
      updateData.last_error = errorMessage;
    }
    
    const { error: healthUpdateError } = await supabase
      .from('integration_health')
      .upsert(updateData, {
        onConflict: 'provider'
      });
    
    if (healthUpdateError) {
      console.error('Error updating integration health:', healthUpdateError);
    } else {
      console.log('Successfully updated integration health status');
    }
  } catch (err) {
    console.error('Failed to update integration health:', err);
  }
}

// Store API rate limit information
export async function storeRateLimitInfo(
  supabase: any, 
  endpoint: string, 
  rateLimitInfo: RateLimitInfo
): Promise<void> {
  try {
    const { error } = await supabase
      .from('guesty_api_usage')
      .insert({
        endpoint,
        rate_limit: rateLimitInfo.rate_limit,
        remaining: rateLimitInfo.remaining,
        reset: rateLimitInfo.reset,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error storing rate limit info:', error);
    }
  } catch (error) {
    console.error('Exception while storing rate limit info:', error);
  }
}
