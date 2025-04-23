
import { BookingData } from './types.ts';
import { delay } from '../utils.ts';

export async function processBookingBatch(
  supabase: any,
  bookings: BookingData[],
  batchSize: number = 10
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (let i = 0; i < bookings.length; i += batchSize) {
    const batch = bookings.slice(i, i + batchSize);
    const bookingIds = batch.map(b => b.id);
    
    const { data: existingBookings, error: selectError } = await supabase
      .from('guesty_bookings')
      .select('id')
      .in('id', bookingIds);

    if (selectError) {
      console.error(`Error checking for existing bookings:`, selectError);
      continue;
    }

    const existingIds = new Set((existingBookings || []).map(b => b.id));
    const bookingsToCreate = batch.filter(b => !existingIds.has(b.id));
    const bookingsToUpdate = batch.filter(b => existingIds.has(b.id));

    if (bookingsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('guesty_bookings')
        .insert(bookingsToCreate);

      if (!insertError) {
        created += bookingsToCreate.length;
      }
    }

    for (const booking of bookingsToUpdate) {
      const { error: updateError } = await supabase
        .from('guesty_bookings')
        .update(booking)
        .eq('id', booking.id);

      if (!updateError) {
        updated++;
      }
    }

    if (i + batchSize < bookings.length) {
      await delay(100);
    }
  }

  return { created, updated };
}

export async function cleanObsoleteBookings(
  supabase: any,
  listingId: string,
  activeBookingIds: Set<string>
): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: localBookings, error } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');
    
    if (error) {
      console.error(`Error querying local bookings for cleanup:`, error);
      return 0;
    }
    
    if (!localBookings || localBookings.length === 0) return 0;
    
    const bookingsToCancel = localBookings.filter(b => !activeBookingIds.has(b.id));
    if (bookingsToCancel.length === 0) return 0;

    console.log(`Marking ${bookingsToCancel.length} obsolete bookings as cancelled`);
    
    const { error: updateError } = await supabase
      .from('guesty_bookings')
      .update({
        status: 'cancelled',
        last_synced: new Date().toISOString()
      })
      .in('id', bookingsToCancel.map(b => b.id));
    
    if (updateError) {
      console.error(`Error cancelling obsolete bookings:`, updateError);
      return 0;
    }
    
    return bookingsToCancel.length;
  } catch (error) {
    console.error(`Error in cleanObsoleteBookings:`, error);
    return 0;
  }
}
