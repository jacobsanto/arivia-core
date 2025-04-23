
export async function processBookings(supabase: any, bookings: any[]): Promise<{ created: number, updated: number }> {
  let created = 0;
  let updated = 0;

  // Process in batches
  const batchSize = 10;
  for (let i = 0; i < bookings.length; i += batchSize) {
    const batch = bookings.slice(i, i + batchSize);
    const bookingIds = batch.map(b => b.id);
    
    // Check which bookings already exist
    const { data: existingBookings, error: queryError } = await supabase
      .from('guesty_bookings')
      .select('id')
      .in('id', bookingIds);
    
    if (queryError) {
      console.error('Error checking for existing bookings:', queryError);
      continue;
    }

    const existingIds = new Set((existingBookings || []).map(b => b.id));
    
    // Separate bookings into new and existing
    const newBookings = batch.filter(b => !existingIds.has(b.id));
    const updatedBookings = batch.filter(b => existingIds.has(b.id));
    
    // Insert new bookings
    if (newBookings.length > 0) {
      const { error: insertError } = await supabase
        .from('guesty_bookings')
        .insert(newBookings);
      
      if (insertError) {
        console.error('Error inserting new bookings:', insertError);
      } else {
        created += newBookings.length;
      }
    }
    
    // Update existing bookings
    for (const booking of updatedBookings) {
      const { error: updateError } = await supabase
        .from('guesty_bookings')
        .update(booking)
        .eq('id', booking.id);
      
      if (updateError) {
        console.error(`Error updating booking ${booking.id}:`, updateError);
      } else {
        updated++;
      }
    }
  }
  
  return { created, updated };
}
