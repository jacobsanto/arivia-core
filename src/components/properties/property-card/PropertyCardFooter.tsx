
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { CardFooter } from "@/components/ui/card";

interface PropertyCardFooterProps {
  property: UnifiedProperty;
}

export const PropertyCardFooter = ({ property }: PropertyCardFooterProps) => {
  return (
    <CardFooter className="pt-2 flex justify-between">
      <div className="flex justify-between w-full text-xs text-muted-foreground">
        <span>{property.bedrooms} Bedrooms</span>
        <span>{property.bathrooms} Bathrooms</span>
      </div>
    </CardFooter>
  );
};
