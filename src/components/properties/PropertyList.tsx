
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Property } from "@/types/property.types";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(key => <div key={key} className="overflow-hidden border rounded-lg shadow-sm">
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
          </div>)}
      </div>;
  }
  
  if (properties.length === 0) {
    return <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No properties found</h3>
        <p className="text-gray-500 mb-6">Add your first property to get started</p>
        <Button onClick={onAddProperty} className="gap-2">
          <Plus size={16} /> Add Property
        </Button>
      </div>;
  }
  
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => <PropertyCard key={property.id} property={property} onViewDetails={onViewDetails} onBookingManagement={onBookingManagement} onPricingConfig={onPricingConfig} onGuestManagement={onGuestManagement} onDelete={onDelete} />)}
    </div>;
};

export default PropertyList;
