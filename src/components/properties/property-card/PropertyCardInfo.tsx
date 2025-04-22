
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { PropertyCardMenu } from "./PropertyCardMenu";

interface PropertyCardInfoProps {
  property: UnifiedProperty;
  onViewDetails: (property: UnifiedProperty) => void;
  onBookingManagement: (property: UnifiedProperty) => void;
  onPricingConfig: (property: UnifiedProperty) => void;
  onGuestManagement: (property: UnifiedProperty) => void;
}

export const PropertyCardInfo = ({
  property,
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
}: PropertyCardInfoProps) => {
  return (
    <div className="flex justify-between items-start">
      <h3 className="text-lg font-medium line-clamp-1">{property.name}</h3>
      <PropertyCardMenu 
        property={property}
        onViewDetails={onViewDetails}
        onBookingManagement={onBookingManagement}
        onPricingConfig={onPricingConfig}
        onGuestManagement={onGuestManagement}
      />
    </div>
  );
};
