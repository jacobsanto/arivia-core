
import React, { useState } from "react";
import { toast } from "sonner";
import { Property } from "@/types/property.types";
import PropertiesListView from "@/components/properties/views/PropertiesListView";
import PropertyDetailsView from "@/components/properties/views/PropertyDetailsView";
import PropertyBookingsView from "@/components/properties/views/PropertyBookingsView";
import PropertyPricingView from "@/components/properties/views/PropertyPricingView";
import PropertyGuestsView from "@/components/properties/views/PropertyGuestsView";

const Properties = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeView, setActiveView] = useState("properties");

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setActiveView("details");
  };

  const handleBookingManagement = (property: Property) => {
    setSelectedProperty(property);
    setActiveView("bookings");
  };
  
  const handlePricingConfig = (property: Property) => {
    setSelectedProperty(property);
    setActiveView("pricing");
  };
  
  const handleGuestManagement = (property: Property) => {
    setSelectedProperty(property);
    setActiveView("guests");
  };

  const handleBackToProperties = () => {
    setActiveView("properties");
    setSelectedProperty(null);
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
    <PropertiesListView 
      onViewDetails={handleViewDetails}
      onBookingManagement={handleBookingManagement}
      onPricingConfig={handlePricingConfig}
      onGuestManagement={handleGuestManagement}
    />
  );
};

export default Properties;
