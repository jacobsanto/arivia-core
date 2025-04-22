
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { PropertyCardMenu } from "./PropertyCardMenu";
import { useNavigate } from "react-router-dom";

interface PropertyCardInfoProps {
  property: UnifiedProperty;
  onViewDetails: (property: UnifiedProperty) => void;
}

export const PropertyCardInfo = ({
  property,
  onViewDetails,
}: PropertyCardInfoProps) => {
  const navigate = useNavigate();
  
  // Simplified to only include view details functionality
  const handleViewDetails = () => {
    // For Guesty properties, navigate to the listing details page
    if (property.source === 'guesty') {
      navigate(`/properties/listings/${property.id}`);
    } else {
      // For local properties, use the existing handler
      onViewDetails(property);
    }
  };

  return (
    <div className="flex justify-between items-start">
      <h3 className="text-lg font-medium line-clamp-1">{property.name}</h3>
      <PropertyCardMenu property={property} onViewDetails={handleViewDetails} />
    </div>
  );
};
