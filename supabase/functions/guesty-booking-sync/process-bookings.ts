
export async function processBookings(
  supabase: any, 
  bookings: any[]
): Promise<{ created: number, updated: number }> {
  let created = 0;
  let updated = 0;
  const batchSize = 10;

  for (let i = 0; i < bookings.length; i += batchSize) {
    const batch = bookings.slice(i, i + batchSize);
    if (!batch.length) continue;

    const bookingIds = batch.map(b => b.id).filter(Boolean);
    if (!bookingIds.length) continue;
    
    try {
      // Check which bookings already exist
      const { data: existingBookings, error: queryError } = await supabase
        .from('guesty_bookings')
        .select('id')
        .in('id', bookingIds);
      
      if (queryError) {
        console.error('[GuestySync] Error checking for existing bookings:', queryError);
        continue;
      }

      const existingIds = new Set((existingBookings || []).map(b => b.id));
      
      // Split bookings into new and updates
      const newBookings = batch.filter(b => !existingIds.has(b.id));
      const updateBookings = batch.filter(b => existingIds.has(b.id));
      
      // Insert new bookings
      if (newBookings.length > 0) {
        const { error: insertError } = await supabase
          .from('guesty_bookings')
          .insert(newBookings);
        
        if (insertError) {
          console.error('[GuestySync] Error inserting new bookings:', insertError);
        } else {
          created += newBookings.length;
        }
      }
      
      // Update existing bookings
      for (const booking of updateBookings) {
        const { error: updateError } = await supabase
          .from('guesty_bookings')
          .update(booking)
          .eq('id', booking.id);
        
        if (updateError) {
          console.error(`[GuestySync] Error updating booking ${booking.id}:`, updateError);
        } else {
          updated++;
        }
      }
    } catch (error) {
      console.error('[GuestySync] Error processing booking batch:', error);
    }
  }
  
  return { created, updated };
}
