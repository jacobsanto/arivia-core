
import { useQuery } from '@tanstack/react-query';
import { SyncLog } from './syncLog.types';

/**
 * Fetches sync logs array from the /api/sync-logs endpoint.
 * 
 * NOTE: You must have a route or handler at /api/sync-logs that returns SyncLog[].
 */
export function useSyncLogs() {
  return useQuery<SyncLog[]>({
    queryKey: ['sync_logs'],
    queryFn: async () => {
      const res = await fetch('/api/sync-logs');
      if (!res.ok) throw new Error('Failed to fetch logs');
      return await res.json();
    }
  });
}
