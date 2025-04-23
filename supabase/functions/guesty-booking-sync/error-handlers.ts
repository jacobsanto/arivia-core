
import { corsHeaders } from './utils.ts';
import { updateSyncLog, updateIntegrationHealth } from './sync-log.ts';

export async function handleError(error: any, supabase: any, syncLog: any, startTime: number) {
  console.error('Error in booking sync:', error);
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error during booking sync';
  
  if (syncLog?.id) {
    await updateSyncLog(supabase, syncLog.id, {
      status: 'error',
      end_time: new Date().toISOString(),
      message: errorMessage,
      sync_duration_ms: Date.now() - startTime
    });
  }
  
  await updateIntegrationHealth(supabase, {
    status: 'error',
    last_error: errorMessage,
    is_rate_limited: errorMessage.toLowerCase().includes('rate limit')
  });
  
  return new Response(
    JSON.stringify({
      success: false,
      message: errorMessage,
      error: errorMessage
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    }
  );
}
