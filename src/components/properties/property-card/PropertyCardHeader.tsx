
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { CardHeader } from "@/components/ui/card";
import { PropertyCardImage } from "./PropertyCardImage";
import { PropertyCardInfo } from "./PropertyCardInfo";

interface PropertyCardHeaderProps {
  property: UnifiedProperty;
  onViewDetails: (property: UnifiedProperty) => void;
  onBookingManagement: (property: UnifiedProperty) => void;
  onPricingConfig: (property: UnifiedProperty) => void;
  onGuestManagement: (property: UnifiedProperty) => void;
}

export const PropertyCardHeader = ({
  property,
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
}: PropertyCardHeaderProps) => {
  return (
    <>
      <PropertyCardImage property={property} />
      <CardHeader className="pb-2">
        <PropertyCardInfo 
          property={property}
          onViewDetails={onViewDetails}
          onBookingManagement={onBookingManagement}
          onPricingConfig={onPricingConfig}
          onGuestManagement={onGuestManagement}
        />
      </CardHeader>
    </>
  );
};
