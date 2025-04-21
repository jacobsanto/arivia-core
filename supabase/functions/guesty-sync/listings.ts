
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { GuestyListing } from './types.ts';

export async function syncGuestyListings(supabase: any, token: string): Promise<GuestyListing[]> {
  try {
    console.log('Starting Guesty listings sync...');
    const response = await fetch('https://open-api.guesty.com/v1/listings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    const data = await response.json();
    const listings = data.results as GuestyListing[];

    console.log(`Syncing ${listings.length} listings...`);

    for (const listing of listings) {
      await supabase.from('guesty_listings').upsert({
        id: listing._id,
        title: listing.title,
        address: listing.address || {},
        status: listing.status,
        property_type: listing.propertyType,
        thumbnail_url: listing.picture?.thumbnail,
        last_synced: new Date().toISOString(),
        raw_data: listing,
      });
    }

    return listings;
  } catch (error) {
    console.error('Error in syncGuestyListings:', error);
    throw error;
  }
}
