
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { BookingData } from './types.ts';
import { delay } from './utils.ts';

interface ProcessBookingsResult {
  created: number;
  updated: number;
}

export async function processBookings(
  supabase: any,
  bookings: BookingData[],
  batchSize = 10
): Promise<ProcessBookingsResult> {
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
      console.error(`[GuestyBookingSync] Error checking for existing bookings:`, selectError);
      continue;
    }

    const existingIds = new Set((existingBookings || []).map(b => b.id));
    const bookingsToCreate = batch.filter(b => !existingIds.has(b.id));
    const bookingsToUpdate = batch.filter(b => existingIds.has(b.id));

    if (bookingsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('guesty_bookings')
        .insert(bookingsToCreate);

      if (insertError) {
        console.error(`[GuestyBookingSync] Error inserting bookings:`, insertError);
      } else {
        created += bookingsToCreate.length;
      }
    }

    for (const booking of bookingsToUpdate) {
      const { error: updateError } = await supabase
        .from('guesty_bookings')
        .update(booking)
        .eq('id', booking.id);

      if (updateError) {
        console.error(`[GuestyBookingSync] Error updating booking ${booking.id}:`, updateError);
        continue;
      }
      updated++;
    }

    if (i + batchSize < bookings.length) {
      await delay(100);
    }
  }

  return { created, updated };
}

