import React from 'react';

interface Props {
  listing: any;
}

const ManageBookingsSection: React.FC<Props> = ({ listing }) => {
  return (
    <section aria-labelledby="manage-bookings-heading" className="space-y-4">
      <h2 id="manage-bookings-heading" className="card-title">Manage Bookings</h2>
      <div className="rounded-lg border p-4 bg-card text-card-foreground">
        <p className="text-sm text-muted-foreground">Controls to manage bookings for {listing?.title || 'this listing'} will appear here.</p>
      </div>
    </section>
  );
};

export default ManageBookingsSection;
