
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { updateSyncLog } from './sync-log.ts';
import { corsHeaders } from './utils.ts';

export async function handleError(error: any, supabase: any, syncLog: any, startTime: number) {
  console.error('Error in booking sync:', error);
  
  // Update sync log with error - now with null safety
  try {
    if (syncLog && syncLog.id) {
      await updateSyncLog(supabase, syncLog.id, {
        status: 'error',
        end_time: new Date().toISOString(),
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        entities_synced: 0,
        sync_duration_ms: Date.now() - startTime
      });
    } else {
      console.warn('Could not update sync log: syncLog or syncLog.id is null/undefined');
    }
  
    // Update health status
    await supabase
      .from('integration_health')
      .update({
        status: 'error',
        last_error: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString()
      })
      .eq('provider', 'guesty');
  } catch (e) {
    console.error('Failed to update integration health with error:', e);
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Booking sync failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }),
    { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

