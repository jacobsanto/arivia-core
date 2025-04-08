
import React from "react";
import { useParams } from "react-router-dom";

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Property Details</h1>
      <p>Property ID: {id}</p>
      <p>This page is under construction.</p>
    </div>
  );
};

export default PropertyDetails;
