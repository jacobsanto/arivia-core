
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGuestyProperties } from "@/hooks/guesty/useGuestyProperties";
import PropertyList from "./PropertyList";
import type { Property } from "@/types/property.types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleX } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const [retryCount, setRetryCount] = useState(0);
  
  const handleRetry = () => {
    setRetryCount(retryCount + 1);
    window.location.reload();
  };
  
  // Show an error UI when we can't connect to the Guesty API
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Guesty Properties</h2>
        </div>
        
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <CircleX className="h-4 w-4" />
          <AlertTitle>Guesty API Not Available</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              The Guesty API integration is not currently available. This may be because:
            </p>
            <ul className="list-disc pl-5 mb-4 text-sm">
              <li>You're running in development mode without Netlify Functions</li>
              <li>The Guesty API credentials need to be configured</li>
              <li>There's a network connectivity issue</li>
            </ul>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { window.location.href = "/settings/integration"; }}
              >
                Configure Integration
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
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
            {isLoading ? <LoadingSpinner size="small" className="mr-2" /> : null}
            {isLoading ? "Loading..." : "Load More Properties"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GuestyPropertiesSection;
