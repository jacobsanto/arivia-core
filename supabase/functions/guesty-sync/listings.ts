import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { GuestyListing } from './types.ts';
import { RateLimitInfo, extractRateLimitInfo, delay } from './utils.ts';

// Export as before.
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

        const listings = data.results as GuestyListing[];
        
        if (listings.length === 0) {
          console.log('No more listings found, ending pagination');
          hasMore = false;
          continue;
        }

        console.log(`Processing ${listings.length} listings from page ${page}...`);

        for (const listing of listings) {
          try {
            if (!listing._id) {
              console.error('Listing missing ID, skipping:', listing);
              continue;
            }

            const { data: existingListing, error: lookupError } = await supabase
              .from('guesty_listings')
              .select('id, last_synced')
              .eq('id', listing._id)
              .single();

            if (lookupError && lookupError.code !== 'PGRST116') { // Not found error is acceptable
              console.error(`Error looking up existing listing ${listing._id}:`, lookupError);
            }

            // Choose highest available resolution: prefer picture.original > picture.large > picture.thumbnail
            const largeImage = listing.picture?.original || listing.picture?.large || listing.picture?.thumbnail || null;

            const listingData = {
              id: listing._id,
              title: listing.title || 'Untitled Listing',
              address: listing.address || {},
              status: listing.status || 'unknown',
              property_type: listing.propertyType || 'unknown',
              thumbnail_url: listing.picture?.thumbnail || null,
              highres_url: largeImage, // <-- new field for high-res images
              last_synced: new Date().toISOString(),
              raw_data: listing,
              sync_status: 'active',
              is_deleted: false
            };

            if (!existingListing) {
              // New listing
              const { error: insertError } = await supabase.from('guesty_listings').insert({
                ...listingData,
                first_synced_at: new Date().toISOString()
              });
              
              if (insertError) {
                console.error(`Error inserting new listing ${listing._id}:`, insertError);
              } else {
                created++;
              }
            } else {
              // Update existing listing
              const { error: updateError } = await supabase.from('guesty_listings')
                .update(listingData)
                .eq('id', listing._id);
              
              if (updateError) {
                console.error(`Error updating listing ${listing._id}:`, updateError);
              } else {
                updated++;
              }
            }

            totalListings = [...totalListings, listing];
          } catch (err) {
            console.error(`Error processing listing ${listing._id || 'unknown'}:`, err);
            // Continue with next listing
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
      await cleanObsoleteListings(supabase, totalListings);
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

async function cleanObsoleteListings(supabase: any, activeFetchedListings: GuestyListing[]) {
  try {
    // Get IDs of all listings fetched from Guesty
    const activeListingIds = new Set(activeFetchedListings.map(l => l._id));

    // Find listings in Supabase that are not in the active set
    const { data: localListings, error: queryError } = await supabase
      .from('guesty_listings')
      .select('id')
      .eq('sync_status', 'active')
      .eq('is_deleted', false);

    if (queryError) {
      console.error('Error querying local listings:', queryError);
      return;
    }

    if (localListings) {
      // Mark listings as archived if they're not in the active set
      const listingsToArchive = localListings.filter(l => !activeListingIds.has(l.id));
      
      if (listingsToArchive.length > 0) {
        console.log(`Marking ${listingsToArchive.length} listings as archived...`);
        const { error: updateError } = await supabase
          .from('guesty_listings')
          .update({
            sync_status: 'archived',
            is_deleted: true,
            last_synced: new Date().toISOString()
          })
          .in('id', listingsToArchive.map(l => l.id));
        
        if (updateError) {
          console.error('Error archiving obsolete listings:', updateError);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning obsolete listings:', error);
    throw error;
  }
}
