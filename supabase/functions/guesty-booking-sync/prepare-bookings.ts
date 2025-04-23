
export function prepareBookings(remoteBookings: any[]): any[] {
  return remoteBookings.map(booking => {
    const totalGuests = 
      (booking.guests?.adults || 0) + 
      (booking.guests?.children || 0) + 
      (booking.guests?.infants || 0);
    
    return {
      id: booking._id || booking.id,
      listing_id: booking.listingId || (booking.listing && booking.listing._id),
      guest_name: booking.guest?.fullName || null,
      guest_email: booking.guest?.email || null,
      amount_paid: booking.price?.totalPrice || 0,
      currency: booking.price?.currency || 'EUR',
      status: booking.status,
      total_guests: totalGuests,
      check_in: booking.startDate || booking.checkIn,
      check_out: booking.endDate || booking.checkOut,
      raw_data: booking,
      last_synced: new Date().toISOString()
    };
  });
}
