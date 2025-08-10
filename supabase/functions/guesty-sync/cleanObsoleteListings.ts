
import type { GuestyListing } from './types.ts';

/**
 * Marks listings as archived in Supabase that are no longer present in the latest Guesty sync.
 * Returns the number of archived listings.
 */
export async function cleanObsoleteListings(supabase: any, activeFetchedListings: GuestyListing[]): Promise<number> {
  try {
    const activeListingIds = new Set(activeFetchedListings.map(l => l._id));

    // Find listings in Supabase that are not in the active set
    const { data: localListings, error: queryError } = await supabase
      .from('guesty_listings')
      .select('id')
      .eq('sync_status', 'active')
      .eq('is_deleted', false);

    if (queryError) {
      console.error('Error querying local listings:', queryError);
      return 0;
    }

    if (localListings) {
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
          return 0;
        }
      }
      return listingsToArchive.length;
    }
    return 0;
  } catch (error) {
    console.error('Error cleaning obsolete listings:', error);
    return 0;
  }
}
