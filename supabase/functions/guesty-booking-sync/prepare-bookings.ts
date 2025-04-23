
export function prepareBookings(remoteBookings: any[]): any[] {
  return remoteBookings
    .filter((booking: any) => booking.status !== 'cancelled' && booking.status !== 'test')
    .map((booking: any) => {
      const bookingId = booking.id || booking._id;
      const propListingId = booking.listingId || (booking.listing && booking.listing._id);
      const guest = booking.guest || {};
      
      if (!bookingId || !propListingId) {
        console.warn("[GuestySync] Missing booking id or listing id, skipping", booking);
        return null;
      }
      
      return {
        id: bookingId,
        listing_id: propListingId,
        guest_name: guest.fullName || guest.name || 'Unknown Guest',
        check_in: booking.startDate || booking.checkIn,
        check_out: booking.endDate || booking.checkOut,
        status: booking.status,
        last_synced: new Date().toISOString(),
        raw_data: booking
      };
    })
    .filter(b => b !== null);
}
