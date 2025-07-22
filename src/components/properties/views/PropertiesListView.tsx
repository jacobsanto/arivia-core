import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import PropertyForm from "@/components/properties/property-form";
import { useProperties } from "@/hooks/useProperties";
import type { Property, UnifiedProperty } from "@/types/property.types";
import PropertyHeader from "@/components/properties/PropertyHeader";
import PropertyFilters from "@/components/properties/PropertyFilters";
import PropertyList from "@/components/properties/PropertyList";
import PropertyPagination from "@/components/properties/PropertyPagination";
import { PropertyAssignmentManager } from "@/components/properties/PropertyAssignmentManager";
import { usePropertyFiltering } from "@/hooks/usePropertyFiltering";

interface PropertiesListViewProps {
  onViewDetails: (property: Property) => void;
  onBookingManagement: (property: Property) => void;
  onPricingConfig: (property: Property) => void;
  onGuestManagement: (property: Property) => void;
}

const PropertiesListView: React.FC<PropertiesListViewProps> = ({
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement
}) => {
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedPropertyForAssignment, setSelectedPropertyForAssignment] = useState<Property | null>(null);
  
  const { 
    properties, 
    isLoading, 
    error, 
    addProperty, 
    deleteProperty,
    fetchProperties 
  } = useProperties();

  const unifiedProperties: UnifiedProperty[] = properties.map(property => ({
    ...property,
    source: 'local',
    last_synced: property.updated_at
  }));

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedProperties
  } = usePropertyFiltering(unifiedProperties);

  const handleAddProperty = () => {
    setIsAddPropertyOpen(true);
  };

  const handlePropertyCreated = async (newProperty: any) => {
    try {
      await addProperty(newProperty);
      toast.success(`${newProperty.name} has been added to your properties`);
      setIsAddPropertyOpen(false);
    } catch (err: any) {
      // Error is handled in the addProperty function
    }
  };

  const handleDeleteProperty = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteProperty(id);
        toast.success(`${name} has been deleted`);
      } catch (err) {
        // Error is handled in the deleteProperty function
      }
    }
  };

  const handleManageAssignments = (property: Property) => {
    setSelectedPropertyForAssignment(property);
    setIsAssignmentDialogOpen(true);
  };

  const handleAssignmentChanged = () => {
    fetchProperties(); // Refresh properties to show updated assignments
  };

  const convertedPaginatedProperties = paginatedProperties as unknown as Property[];

  return (
    <div className="space-y-8">
      <PropertyHeader onAddProperty={handleAddProperty} />
      
      <PropertyFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <PropertyList 
        properties={convertedPaginatedProperties}
        isLoading={isLoading}
        onViewDetails={onViewDetails}
        onBookingManagement={onBookingManagement}
        onPricingConfig={onPricingConfig}
        onGuestManagement={onGuestManagement}
        onDelete={handleDeleteProperty}
        onAddProperty={handleAddProperty}
        onManageAssignments={handleManageAssignments}
      />
      
      <PropertyPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <PropertyForm onSubmit={handlePropertyCreated} />
        </DialogContent>
      </Dialog>

      <PropertyAssignmentManager
        property={selectedPropertyForAssignment}
        isOpen={isAssignmentDialogOpen}
        onClose={() => {
          setIsAssignmentDialogOpen(false);
          setSelectedPropertyForAssignment(null);
        }}
        onAssignmentChanged={handleAssignmentChanged}
      />
    </div>
  );
};

export default PropertiesListView;
