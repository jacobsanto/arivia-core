
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { MapPin } from "lucide-react";
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
      <div className="overflow-hidden">
        <h3 className="text-lg font-medium line-clamp-1">{property.name}</h3>
        {property.address && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{property.address}</span>
          </div>
        )}
      </div>
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
