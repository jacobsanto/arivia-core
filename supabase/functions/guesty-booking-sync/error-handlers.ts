
import { corsHeaders } from './utils.ts';

export const handleError = (error: unknown, supabase: any, syncLog: any | null, startTime: number) => {
  console.error('Booking sync error:', error);
  
  if (syncLog?.id && supabase) {
    updateSyncLog(supabase, syncLog.id, {
      status: 'error',
      end_time: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown error',
      sync_duration: Date.now() - startTime
    });
  }

  const isRateLimit = error instanceof Error && 
    (error.message?.includes('429') || error.message?.includes('Too Many Requests'));
  
  if (supabase) {
    updateIntegrationHealth(supabase, {
      status: 'error',
      last_error: error instanceof Error ? error.message : 'Unknown error',
      is_rate_limited: isRateLimit
    });
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during booking sync',
      error: error instanceof Error ? error.message : 'Unknown error'
    }),
    {
      status: isRateLimit ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
};

