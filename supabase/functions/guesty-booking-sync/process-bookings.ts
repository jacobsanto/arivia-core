
import { BookingData } from './types.ts';

export async function processBookings(supabase: any, bookingsToProcess: BookingData[]): Promise<{ created: number, updated: number }> {
  let created = 0;
  let updated = 0;

  if (bookingsToProcess.length === 0) {
    return { created, updated };
  }
  
  // Process bookings in batches of 10 to avoid overloading the database
  const batchSize = 10;
  const totalBatches = Math.ceil(bookingsToProcess.length / batchSize);
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, bookingsToProcess.length);
    const batch = bookingsToProcess.slice(start, end);
    
    // Process each booking in the batch
    for (const booking of batch) {
      // Check if the booking exists
      const { data: existingBooking, error: checkError } = await supabase
        .from('guesty_bookings')
        .select('id, updated_at')
        .eq('id', booking.id)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking booking ${booking.id}:`, checkError);
        continue; // Skip this booking but continue with others
      }

      try {
        if (existingBooking) {
          // Update existing booking
          const { error: updateError } = await supabase
            .from('guesty_bookings')
            .update({
              guest_name: booking.guest_name,
              check_in: booking.check_in,
              check_out: booking.check_out,
              status: booking.status,
              raw_data: booking.raw_data,
              last_synced: booking.last_synced
            })
            .eq('id', booking.id);

          if (updateError) {
            throw updateError;
          }
          
          updated++;
        } else {
          // Insert new booking
          const { error: insertError } = await supabase
            .from('guesty_bookings')
            .insert([booking]);

          if (insertError) {
            throw insertError;
          }
          
          created++;
        }
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        // Continue with next booking
      }
    }
    
    // Add a small delay between batches to avoid overwhelming the database
    if (i < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return { created, updated };
}
