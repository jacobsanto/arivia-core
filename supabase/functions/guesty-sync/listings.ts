
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { GuestyListing } from './types.ts';
import { RateLimitInfo, extractRateLimitInfo, delay } from './utils.ts';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function syncGuestyListings(supabase: any, token: string): Promise<{
  listings: GuestyListing[];
  rateLimitInfo: RateLimitInfo | null;
}> {
  try {
    console.log('Starting Guesty listings sync...');
    
    // Create sync log entry
    const { data: syncLog } = await supabase
      .from('sync_logs')
      .insert({
        service: 'guesty',
        status: 'in_progress'
      })
      .select()
      .single();

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
        const response = await fetch(`https://open-api.guesty.com/v1/listings?page=${page}&limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        // Extract rate limit info from headers
        rateLimitInfo = extractRateLimitInfo(response.headers);
        
        if (!response.ok) {
          if (response.status === 429) {
            console.log('Rate limited, waiting before retry...');
            await delay(5000); // Wait 5 seconds before retrying
            continue;
          }
          throw new Error(`Failed to fetch listings: ${response.statusText}`);
        }

        const data = await response.json();
        const listings = data.results as GuestyListing[];
        
        if (listings.length === 0) {
          hasMore = false;
          continue;
        }

        console.log(`Processing ${listings.length} listings from page ${page}...`);

        for (const listing of listings) {
          const { data: existingListing } = await supabase
            .from('guesty_listings')
            .select('id, last_synced')
            .eq('id', listing._id)
            .single();

          // Choose highest available resolution: prefer picture.original > picture.large > picture.thumbnail
          const largeImage = listing.picture?.original || listing.picture?.large || listing.picture?.thumbnail || null;

          const listingData = {
            id: listing._id,
            title: listing.title,
            address: listing.address || {},
            status: listing.status,
            property_type: listing.propertyType,
            thumbnail_url: listing.picture?.thumbnail,
            highres_url: largeImage, // <-- new field for high-res images
            last_synced: new Date().toISOString(),
            raw_data: listing,
            sync_status: 'active',
            is_deleted: false
          };

          if (!existingListing) {
            // New listing
            await supabase.from('guesty_listings').insert({
              ...listingData,
              first_synced_at: new Date().toISOString()
            });
            created++;
          } else {
            // Update existing listing
            await supabase.from('guesty_listings')
              .update(listingData)
              .eq('id', listing._id);
            updated++;
          }

          totalListings = [...totalListings, listing];
        }

        page++;
        
        // Add a small delay between pages to reduce risk of rate limiting
        if (rateLimitInfo && rateLimitInfo.remaining < 10) {
          await delay(1000);
        }

      } catch (error) {
        console.error(`Error processing page ${page}:`, error);
        throw error;
      }
    }

    // Clean up obsolete listings
    await cleanObsoleteListings(supabase, totalListings);

    // Update sync log with final counts
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

    console.log(`Sync completed: ${created} created, ${updated} updated, ${archived} archived`);
    return { listings: totalListings, rateLimitInfo };

  } catch (error) {
    console.error('Error in syncGuestyListings:', error);
    throw error;
  }
}

async function cleanObsoleteListings(supabase: any, activeFetchedListings: GuestyListing[]) {
  try {
    // Get IDs of all listings fetched from Guesty
    const activeListingIds = new Set(activeFetchedListings.map(l => l._id));

    // Find listings in Supabase that are not in the active set
    const { data: localListings } = await supabase
      .from('guesty_listings')
      .select('id')
      .eq('sync_status', 'active')
      .eq('is_deleted', false);

    if (localListings) {
      // Mark listings as archived if they're not in the active set
      const listingsToArchive = localListings.filter(l => !activeListingIds.has(l.id));
      
      if (listingsToArchive.length > 0) {
        console.log(`Marking ${listingsToArchive.length} listings as archived...`);
        await supabase
          .from('guesty_listings')
          .update({
            sync_status: 'archived',
            is_deleted: true,
            last_synced: new Date().toISOString()
          })
          .in('id', listingsToArchive.map(l => l.id));
      }
    }
  } catch (error) {
    console.error('Error cleaning obsolete listings:', error);
    throw error;
  }
}
