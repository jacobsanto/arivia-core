
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import PropertyForm from "@/components/properties/PropertyForm";
import BookingCalendar from "@/components/properties/bookings";
import PricingConfig from "@/components/properties/PricingConfig";
import GuestManagement from "@/components/properties/GuestManagement";
import { useProperties, Property } from "@/hooks/useProperties";
import PropertyHeader from "@/components/properties/PropertyHeader";
import PropertyFilters from "@/components/properties/PropertyFilters";
import PropertyList from "@/components/properties/PropertyList";
import PropertyDetails from "@/components/properties/PropertyDetails";

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeView, setActiveView] = useState("properties");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  
  const { 
    properties, 
    isLoading, 
    error, 
    fetchProperties, 
    addProperty, 
    updateProperty, 
    deleteProperty 
  } = useProperties();

  useEffect(() => {
    if (error) {
      toast.error('Failed to load properties', {
        description: error
      });
    }
  }, [error]);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "occupied" && property.status === "Occupied") ||
      (activeTab === "vacant" && property.status === "Vacant") ||
      (activeTab === "maintenance" && property.status === "Maintenance");

    return matchesSearch && matchesTab;
  });

  const handleAddProperty = () => {
    setIsAddPropertyOpen(true);
  };

  const handlePropertyCreated = async (newProperty: any) => {
    try {
      await addProperty(newProperty);
      toast.success(`${newProperty.name} has been added to your properties`);
      setIsAddPropertyOpen(false);
    } catch (err: any) {
      // Error handling is done in the hook
    }
  };

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

  const handleDeleteProperty = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteProperty(id);
        toast.success(`${name} has been deleted`);
      } catch (err) {
        // Error handling is done in the hook
      }
    }
  };

  if (activeView === "details" && selectedProperty) {
    return <PropertyDetails property={selectedProperty} onBack={handleBackToProperties} />;
  }
  
  if (activeView === "bookings" && selectedProperty) {
    return <BookingCalendar property={selectedProperty} onBack={handleBackToProperties} />;
  }
  
  if (activeView === "pricing" && selectedProperty) {
    return <PricingConfig property={selectedProperty} onBack={handleBackToProperties} />;
  }
  
  if (activeView === "guests" && selectedProperty) {
    return <GuestManagement property={selectedProperty} onBack={handleBackToProperties} />;
  }

  return (
    <div className="space-y-6">
      <PropertyHeader onAddProperty={handleAddProperty} />
      <PropertyFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <PropertyList 
        properties={filteredProperties}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onBookingManagement={handleBookingManagement}
        onPricingConfig={handlePricingConfig}
        onGuestManagement={handleGuestManagement}
        onDelete={handleDeleteProperty}
        onAddProperty={handleAddProperty}
      />

      <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <PropertyForm onSubmit={handlePropertyCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Properties;
