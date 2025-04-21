
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import PropertyForm from "@/components/properties/property-form";
import { useProperties } from "@/hooks/useProperties";
import type { Property } from "@/types/property.types";
import PropertyHeader from "@/components/properties/PropertyHeader";
import PropertyFilters from "@/components/properties/PropertyFilters";
import PropertyList from "@/components/properties/PropertyList";
import PropertyPagination from "@/components/properties/PropertyPagination";
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

  const { 
    properties, 
    isLoading, 
    error, 
    addProperty, 
    deleteProperty 
  } = useProperties();

  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    handleAdvancedFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedProperties,
    activeFiltersCount
  } = usePropertyFiltering(properties);

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

  return (
    <div className="space-y-8">
      <PropertyHeader onAddProperty={handleAddProperty} />
      <PropertyFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAdvancedFilters={handleAdvancedFilters}
        activeFiltersCount={activeFiltersCount}
      />
      <PropertyList 
        properties={paginatedProperties}
        isLoading={isLoading}
        onViewDetails={onViewDetails}
        onBookingManagement={onBookingManagement}
        onPricingConfig={onPricingConfig}
        onGuestManagement={onGuestManagement}
        onDelete={handleDeleteProperty}
        onAddProperty={handleAddProperty}
      />
      <PropertyPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      {/* Guesty Integration section was removed */}
    </div>
  );
};

export default PropertiesListView;
