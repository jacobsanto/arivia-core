
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedProperty } from "@/types/property.types";
import UnifiedPropertyCard from "./UnifiedPropertyCard";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface UnifiedPropertiesListProps {
  properties: UnifiedProperty[];
  isLoading: boolean;
  onViewDetails: (property: UnifiedProperty) => void;
  onBookingManagement: (property: UnifiedProperty) => void;
  onPricingConfig: (property: UnifiedProperty) => void;
  onGuestManagement: (property: UnifiedProperty) => void;
  onSync: () => void;
}

const UnifiedPropertiesList = ({ 
  properties, 
  isLoading, 
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
  onSync
}: UnifiedPropertiesListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <div key={key} className="overflow-hidden border rounded-lg shadow-sm">
            <div className="relative h-48">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="p-6 pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="px-6 pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <div className="px-6 py-4 pt-2">
              <div className="flex justify-between w-full">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No properties found</h3>
        <p className="text-muted-foreground mb-6">
          Sync your properties from Guesty to get started.
        </p>
        <Button 
          onClick={onSync}
          className="inline-flex items-center justify-center gap-2"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Sync with Guesty
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <UnifiedPropertyCard 
          key={property.id} 
          property={property} 
          onViewDetails={onViewDetails}
          onBookingManagement={onBookingManagement}
          onPricingConfig={onPricingConfig}
          onGuestManagement={onGuestManagement}
        />
      ))}
    </div>
  );
};

export default UnifiedPropertiesList;
