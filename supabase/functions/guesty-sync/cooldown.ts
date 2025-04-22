
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { calculateNextRetryTime } from './utils.ts';

// Check if a sync operation can proceed or needs to wait due to cooldown or rate limiting
export async function checkSyncCooldown(
  supabase: any
): Promise<{ 
  canProceed: boolean; 
  message?: string; 
  nextRetryTime?: string;
  status?: number;
  retryCount: number;
  backoffTime: number;
}> {
  const fifteenMinutesAgo = new Date();
  fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
  
  // Check for recent successful syncs (cooldown period)
  const { data: recentSync, error: recentSyncError } = await supabase
    .from('sync_logs')
    .select('*')
    .eq('service', 'guesty')
    .eq('status', 'completed')
    .gt('start_time', fifteenMinutesAgo.toISOString())
    .order('start_time', { ascending: false })
    .limit(1);

  if (recentSyncError) {
    console.error('Error checking recent syncs:', recentSyncError);
  }

  // Get latest sync attempt regardless of status
  const { data: latestSync, error: latestSyncError } = await supabase
    .from('sync_logs')
    .select('*')
    .eq('service', 'guesty')
    .order('start_time', { ascending: false })
    .limit(1);
  
  if (latestSyncError) {
    console.error('Error checking latest sync:', latestSyncError);
  }

  // Default values
  let backoffTime = 15;
  let retryCount = 0;
  let rateLimited = false;

  // Check for rate limiting from previous attempts
  if (latestSync && latestSync.length > 0) {
    retryCount = latestSync[0].retry_count || 0;
    
    if (latestSync[0].status === 'error') {
      if (latestSync[0].message && latestSync[0].message.includes('Too Many Requests')) {
        rateLimited = true;
        retryCount++;
      }
    }
  }

  // Calculate backoff time for rate limited requests
  if (rateLimited) {
    backoffTime = calculateNextRetryTime(retryCount);
  } 
  // Check recent sync cooldown
  else if (recentSync && recentSync.length > 0) {
    console.log('Recent sync found, enforcing cooldown period');
    return {
      canProceed: false,
      message: 'Please wait before syncing again. A sync was performed in the last 15 minutes.',
      status: 429,
      retryCount,
      backoffTime
    };
  }

  // Check if we need to wait due to rate limiting
  if (rateLimited && latestSync && latestSync.length > 0) {
    const nextRetryTime = new Date(latestSync[0].next_retry_time || latestSync[0].start_time);
    nextRetryTime.setMinutes(nextRetryTime.getMinutes() + backoffTime);
    
    if (nextRetryTime > new Date()) {
      const waitTimeMinutes = Math.ceil((nextRetryTime.getTime() - Date.now()) / (60 * 1000));
      return {
        canProceed: false,
        message: `Rate limit cooldown in effect. Please wait approximately ${waitTimeMinutes} minutes before retrying.`,
        nextRetryTime: nextRetryTime.toISOString(),
        status: 429,
        retryCount,
        backoffTime
      };
    }
  }

  // If we got here, the sync can proceed
  return {
    canProceed: true,
    retryCount: rateLimited ? retryCount : 0,
    backoffTime
  };
}
