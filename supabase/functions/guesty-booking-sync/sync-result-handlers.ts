
import { corsHeaders } from './utils.ts';

export const createSuccessResponse = (
  totalBookingsSynced: number, 
  results: any[], 
  created: number, 
  updated: number, 
  deleted: number, 
  startTime: number
) => {
  const moreListingsToProcess = false;
  
  return new Response(
    JSON.stringify({
      success: true,
      message: `Successfully synced ${totalBookingsSynced} bookings`,
      bookingsSynced: totalBookingsSynced,
      listings: results.length,
      created,
      updated,
      deleted,
      results,
      moreListingsToProcess,
      processedCount: results.length,
      executionTime: Date.now() - startTime
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
};

