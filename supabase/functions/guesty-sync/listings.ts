
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { GuestyListing } from './types.ts';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function syncGuestyListings(supabase: any, token: string): Promise<GuestyListing[]> {
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

    // Get last sync time from sync_logs
    const { data: lastSync } = await supabase
      .from('sync_logs')
      .select('end_time')
      .eq('service', 'guesty')
      .eq('status', 'completed')
      .order('end_time', { ascending: false })
      .limit(1)
      .single();

    const lastSyncTime = lastSync?.end_time;
    console.log(`Last successful sync: ${lastSyncTime || 'Never'}`);

    let page = 1;
    let hasMore = true;
    let totalListings: GuestyListing[] = [];
    let created = 0;
    let updated = 0;
    let deleted = 0;

    while (hasMore) {
      try {
        const response = await fetch(`https://open-api.guesty.com/v1/listings?page=${page}&limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

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

          const listingData = {
            id: listing._id,
            title: listing.title,
            address: listing.address || {},
            status: listing.status,
            property_type: listing.propertyType,
            thumbnail_url: listing.picture?.thumbnail,
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

          // Add delay between operations to avoid rate limiting
          await delay(100);
        }

        totalListings = [...totalListings, ...listings];
        page++;

      } catch (error) {
        console.error(`Error processing page ${page}:`, error);
        throw error;
      }
    }

    // Mark listings not in the sync as deleted
    const { data: activeListingIds } = await supabase
      .from('guesty_listings')
      .select('id')
      .eq('sync_status', 'active')
      .eq('is_deleted', false);

    const currentListingIds = new Set(totalListings.map(l => l._id));
    const deletedListings = (activeListingIds || [])
      .filter(l => !currentListingIds.has(l.id));

    if (deletedListings.length > 0) {
      await supabase
        .from('guesty_listings')
        .update({ 
          is_deleted: true, 
          sync_status: 'deleted',
          last_synced: new Date().toISOString()
        })
        .in('id', deletedListings.map(l => l.id));
      deleted = deletedListings.length;
    }

    // Update sync log
    await supabase
      .from('sync_logs')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
        listings_created: created,
        listings_updated: updated,
        listings_deleted: deleted
      })
      .eq('id', syncLog.id);

    console.log(`Sync completed: ${created} created, ${updated} updated, ${deleted} deleted`);
    return totalListings;

  } catch (error) {
    console.error('Error in syncGuestyListings:', error);
    
    // Update sync log with error
    if (syncLog?.id) {
      await supabase
        .from('sync_logs')
        .update({
          end_time: new Date().toISOString(),
          status: 'error',
          error_message: error.message
        })
        .eq('id', syncLog.id);
    }
    
    throw error;
  }
}
