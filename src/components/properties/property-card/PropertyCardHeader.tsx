
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { MapPin } from "lucide-react";
import { PropertyCardMenu } from "./PropertyCardMenu";
import { CardHeader } from "@/components/ui/card";

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
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {property.source === 'guesty' && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
            Guesty
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium line-clamp-1">{property.name}</h3>
            {property.address && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
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
      </CardHeader>
    </>
  );
};
