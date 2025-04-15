
import React from "react";
import { Button } from "@/components/ui/button";
import { useGuestyProperties } from "@/hooks/guesty/useGuestyProperties";
import PropertyList from "./PropertyList";
import { Property } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface GuestyPropertiesSectionProps {
  onViewDetails: (property: Property) => void;
  onBookingManagement: (property: Property) => void;
  onPricingConfig: (property: Property) => void;
  onGuestManagement: (property: Property) => void;
  onDelete: (id: string, name: string) => void;
  onAddProperty: () => void;
}

const GuestyPropertiesSection: React.FC<GuestyPropertiesSectionProps> = ({
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
  onDelete,
  onAddProperty
}) => {
  const { properties, isLoading, error, hasMore, loadMore } = useGuestyProperties();
  
  if (error) {
    toast.error('Failed to load Guesty properties', {
      description: error.message
    });
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Guesty Properties</h2>
        <Button variant="outline" onClick={() => toast.info("Syncing properties with Guesty...")}>
          Sync with Guesty
        </Button>
      </div>
      
      <PropertyList 
        properties={properties}
        isLoading={isLoading}
        onViewDetails={onViewDetails}
        onBookingManagement={onBookingManagement}
        onPricingConfig={onPricingConfig}
        onGuestManagement={onGuestManagement}
        onDelete={onDelete}
        onAddProperty={onAddProperty}
      />
      
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={isLoading}
          >
            {isLoading ? <Skeleton className="h-4 w-20" /> : "Load More Properties"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GuestyPropertiesSection;
