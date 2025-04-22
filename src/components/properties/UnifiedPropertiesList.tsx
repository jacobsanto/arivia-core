
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedProperty } from "@/types/property.types";
import PropertyCard from "./property-card/PropertyCard";

interface UnifiedPropertiesListProps {
  properties: UnifiedProperty[];
  isLoading: boolean;
}

const UnifiedPropertiesList: React.FC<UnifiedPropertiesListProps> = ({ 
  properties, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No properties found</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onViewDetails={() => {}}
          onBookingManagement={() => {}}
          onPricingConfig={() => {}}
          onGuestManagement={() => {}}
        />
      ))}
    </div>
  );
};

export default UnifiedPropertiesList;
