
import React, { useState } from "react";
import { toast } from "sonner";
import { UnifiedProperty } from "@/types/property.types";
import PropertyDetailsView from "@/components/properties/views/PropertyDetailsView";
import PropertyBookingsView from "@/components/properties/views/PropertyBookingsView";
import PropertyPricingView from "@/components/properties/views/PropertyPricingView";
import PropertyGuestsView from "@/components/properties/views/PropertyGuestsView";
import { useUnifiedProperties } from "@/hooks/useUnifiedProperties";
import UnifiedPropertyHeader from "@/components/properties/UnifiedPropertyHeader";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import UnifiedPropertiesList from "@/components/properties/UnifiedPropertiesList";
import { usePropertyFiltering } from "@/hooks/usePropertyFiltering";
import PropertyPagination from "@/components/properties/PropertyPagination";

const Properties = () => {
  const [selectedProperty, setSelectedProperty] = useState<UnifiedProperty | null>(null);
  const [activeView, setActiveView] = useState("properties");
  
  const { 
    properties, 
    isLoading, 
    lastSynced,
    syncWithGuesty
  } = useUnifiedProperties();

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

  const handleViewDetails = (property: UnifiedProperty) => {
    setSelectedProperty(property);
    setActiveView("details");
  };

  const handleBookingManagement = (property: UnifiedProperty) => {
    setSelectedProperty(property);
    setActiveView("bookings");
  };
  
  const handlePricingConfig = (property: UnifiedProperty) => {
    setSelectedProperty(property);
    setActiveView("pricing");
  };
  
  const handleGuestManagement = (property: UnifiedProperty) => {
    setSelectedProperty(property);
    setActiveView("guests");
  };

  const handleBackToProperties = () => {
    setActiveView("properties");
    setSelectedProperty(null);
  };

  const handleSync = async () => {
    try {
      await syncWithGuesty();
      toast.success("Properties synced successfully from Guesty");
    } catch (error) {
      toast.error("Failed to sync properties");
    }
  };

  // Render the appropriate view based on the activeView state
  if (activeView === "details" && selectedProperty) {
    return <PropertyDetailsView property={selectedProperty} onBack={handleBackToProperties} />;
  }
  
  if (activeView === "bookings" && selectedProperty) {
    return <PropertyBookingsView property={selectedProperty} onBack={handleBackToProperties} />;
  }
  
  if (activeView === "pricing" && selectedProperty) {
    return <PropertyPricingView property={selectedProperty} onBack={handleBackToProperties} />;
  }
  
  if (activeView === "guests" && selectedProperty) {
    return <PropertyGuestsView property={selectedProperty} onBack={handleBackToProperties} />;
  }

  return (
    <div className="space-y-8">
      <UnifiedPropertyHeader 
        onSync={handleSync} 
        isLoading={isLoading} 
        lastSynced={lastSynced} 
      />
      
      <PropertyFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAdvancedFilters={handleAdvancedFilters}
        activeFiltersCount={activeFiltersCount}
      />

      <UnifiedPropertiesList 
        properties={paginatedProperties}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onBookingManagement={handleBookingManagement}
        onPricingConfig={handlePricingConfig}
        onGuestManagement={handleGuestManagement}
        onSync={handleSync}
      />
      
      <PropertyPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Properties;
