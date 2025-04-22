
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { CardFooter } from "@/components/ui/card";
import { Bed, Bath } from "lucide-react";

interface PropertyCardFooterProps {
  property: UnifiedProperty;
}

export const PropertyCardFooter = ({ property }: PropertyCardFooterProps) => {
  return (
    <CardFooter className="pt-0 flex justify-between">
      <div className="flex justify-between w-full text-xs">
        <div className="flex items-center gap-1">
          <Bed className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Bath className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
        </div>
      </div>
    </CardFooter>
  );
};
