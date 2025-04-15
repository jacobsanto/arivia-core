
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Property } from "@/hooks/useProperties";
import PropertyCard from "./PropertyCard";

interface PropertyListProps {
  properties: Property[];
  isLoading: boolean;
  onViewDetails: (property: Property) => void;
  onBookingManagement: (property: Property) => void;
  onPricingConfig: (property: Property) => void;
  onGuestManagement: (property: Property) => void;
  onDelete: (id: string, name: string) => void;
  onAddProperty: () => void;
}

const PropertyList = ({ 
  properties, 
  isLoading, 
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
  onDelete,
  onAddProperty
}: PropertyListProps) => {
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
          You haven't added any properties yet.
        </p>
        <button 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          onClick={onAddProperty}
        >
          Add Your First Property
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard 
          key={property.id} 
          property={property} 
          onViewDetails={onViewDetails}
          onBookingManagement={onBookingManagement}
          onPricingConfig={onPricingConfig}
          onGuestManagement={onGuestManagement}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default PropertyList;
