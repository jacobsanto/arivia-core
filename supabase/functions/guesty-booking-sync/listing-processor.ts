
import { processBatch } from './process-batch';
import type { ProcessingResult } from './types';

export async function processListings(
  supabase: any, 
  token: string,
  listingIds: string[],
  startTime: number,
  maxRuntime: number
): Promise<ProcessingResult> {
  return processBatch(supabase, token, listingIds, startTime, maxRuntime);
}
