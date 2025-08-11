import React from 'react';

export const BookingsSection: React.FC<{ listingId: string }>= ({ listingId }) => {
  return (
    <section aria-labelledby="bookings-heading" className="space-y-4">
      <h2 id="bookings-heading" className="card-title">Bookings</h2>
      <div className="rounded-lg border p-4 bg-card text-card-foreground">
        <p className="text-sm text-muted-foreground">Showing bookings for listing ID: {listingId}</p>
      </div>
    </section>
  );
};
