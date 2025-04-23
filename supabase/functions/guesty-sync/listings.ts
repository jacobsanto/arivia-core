
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import type { GuestyListing } from './types.ts';
import { RateLimitInfo, extractRateLimitInfo, delay } from './utils.ts';
import { processListing } from './processListing.ts';
import { cleanObsoleteListings } from './cleanObsoleteListings.ts';

export async function syncGuestyListings(supabase: any, token: string): Promise<{
  listings: GuestyListing[];
  rateLimitInfo: RateLimitInfo | null;
}> {
  try {
    console.log('Starting Guesty listings sync...');
    
    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from('sync_logs')
      .insert({
        service: 'guesty',
        status: 'in_progress'
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('Error creating listing sync log:', syncLogError);
    }

    let page = 1;
    let hasMore = true;
    let totalListings: GuestyListing[] = [];
    let created = 0;
    let updated = 0;
    let archived = 0;
    let rateLimitInfo: RateLimitInfo | null = null;

    // Get all active listings from Guesty
    while (hasMore) {
      try {
        console.log(`Fetching listings page ${page}...`);
        const response = await fetch(`https://open-api.guesty.com/v1/listings?page=${page}&limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        // Extract rate limit info from headers
        rateLimitInfo = extractRateLimitInfo(response.headers);
        if (rateLimitInfo) {
          console.log(`Rate limit info - Remaining: ${rateLimitInfo.remaining}/${rateLimitInfo.rate_limit}`);
        }
        
        if (!response.ok) {
          if (response.status === 429) {
            console.error('Rate limited by Guesty API, waiting before retry...');
            await delay(5000); // Wait 5 seconds before retrying
            continue;
          }
          const errorText = await response.text();
          throw new Error(`Failed to fetch listings (HTTP ${response.status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.results)) {
          console.error('Unexpected response format from Guesty API:', data);
          throw new Error('Invalid response format from Guesty API');
        }

        const listings: GuestyListing[] = data.results;
        
        if (listings.length === 0) {
          console.log('No more listings found, ending pagination');
          hasMore = false;
          continue;
        }

        console.log(`Processing ${listings.length} listings from page ${page}...`);

        for (const listing of listings) {
          try {
            const opResult = await processListing(supabase, listing);

            if (opResult === 'created') created++;
            else if (opResult === 'updated') updated++;

            totalListings.push(listing);
          } catch (err) {
            console.error(`Error processing listing ${listing._id || 'unknown'}:`, err);
          }
        }

        page++;
        
        // Add a small delay between pages to reduce risk of rate limiting
        if (rateLimitInfo && rateLimitInfo.remaining < 10) {
          console.log('Low rate limit remaining, adding delay between requests');
          await delay(1000);
        }

      } catch (error) {
        console.error(`Error processing page ${page}:`, error);
        throw error; // Propagate to caller
      }
    }

    // Clean up obsolete listings
    try {
      const archivedCount = await cleanObsoleteListings(supabase, totalListings);
      archived = archivedCount || 0;
    } catch (err) {
      console.error('Error cleaning obsolete listings:', err);
    }

    // Update sync log with final counts
    if (syncLog?.id) {
      try {
        await supabase
          .from('sync_logs')
          .update({
            end_time: new Date().toISOString(),
            status: 'completed',
            listings_created: created,
            listings_updated: updated,
            listings_deleted: archived
          })
          .eq('id', syncLog.id);
      } catch (err) {
        console.error('Error updating listing sync log:', err);
      }
    }

    console.log(`Listings sync completed: ${created} created, ${updated} updated, ${archived} archived`);
    return { listings: totalListings, rateLimitInfo };

  } catch (error) {
    console.error('Error in syncGuestyListings:', error);
    throw error;
  }
}
