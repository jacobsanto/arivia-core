
import React from 'react';
import { useParams } from 'react-router-dom';

const ListingDetails = () => {
  const { listingId } = useParams();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Listing Details</h1>
      <p>Listing ID: {listingId}</p>
    </div>
  );
};

export default ListingDetails;
