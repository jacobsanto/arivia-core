import React from 'react';

interface Props {
  listing: any;
}

const PropertyInfoSection: React.FC<Props> = ({ listing }) => {
  return (
    <section aria-labelledby="property-info-heading" className="space-y-4">
      <h2 id="property-info-heading" className="card-title">Property Information</h2>
      <article className="rounded-lg border p-4 bg-card text-card-foreground">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Title</p>
            <p className="font-medium">{listing?.title || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">{listing?.address || listing?.location || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{listing?.status || 'Active'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Bedrooms</p>
            <p className="font-medium">{listing?.bedrooms ?? '-'}</p>
          </div>
        </div>
      </article>
    </section>
  );
};

export default PropertyInfoSection;
