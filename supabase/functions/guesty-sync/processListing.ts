
import type { GuestyListing } from './types.ts';

/**
 * Insert or update a Guesty listing in Supabase.
 * Returns 'created', 'updated', or undefined on error (for analytics).
 */
export async function processListing(supabase: any, listing: GuestyListing): Promise<'created' | 'updated' | undefined> {
  try {
    if (!listing._id) {
      console.error('Listing missing ID, skipping:', listing);
      return;
    }

    const { data: existingListing, error: lookupError } = await supabase
      .from('guesty_listings')
      .select('id, last_synced')
      .eq('id', listing._id)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') {
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
      highres_url: largeImage,
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
        return;
      }
      return 'created';
    } else {
      // Update existing listing
      const { error: updateError } = await supabase.from('guesty_listings')
        .update(listingData)
        .eq('id', listing._id);
      if (updateError) {
        console.error(`Error updating listing ${listing._id}:`, updateError);
        return;
      }
      return 'updated';
    }
  } catch (err) {
    console.error(`Error processing listing ${listing._id || 'unknown'}:`, err);
    return;
  }
}
