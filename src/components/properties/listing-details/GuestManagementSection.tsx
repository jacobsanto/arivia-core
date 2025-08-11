import React from 'react';

interface Props {
  listing: any;
  isLoading?: boolean;
}

const GuestManagementSection: React.FC<Props> = ({ listing, isLoading }) => {
  if (isLoading) {
    return <div className="text-muted-foreground">Loading guests...</div>;
  }
  return (
    <section aria-labelledby="guest-management-heading" className="space-y-4">
      <h2 id="guest-management-heading" className="card-title">Guest Management</h2>
      <div className="rounded-lg border p-4 bg-card text-card-foreground">
        <p className="text-sm text-muted-foreground">Manage guests for {listing?.title || 'this listing'}.</p>
      </div>
    </section>
  );
};

export default GuestManagementSection;
