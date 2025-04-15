
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import PropertyForm from "@/components/properties/property-form";
import BookingCalendar from "@/components/properties/bookings";
import PricingConfig from "@/components/properties/PricingConfig";
import GuestManagement from "@/components/properties/GuestManagement";
import { useProperties, Property } from "@/hooks/useProperties";
import PropertyHeader from "@/components/properties/PropertyHeader";
import PropertyFilters from "@/components/properties/PropertyFilters";
import PropertyList from "@/components/properties/PropertyList";
import PropertyDetails from "@/components/properties/PropertyDetails";
import PropertyPagination from "@/components/properties/PropertyPagination";
import GuestyPropertiesSection from "@/components/properties/GuestyPropertiesSection";

// Define the advanced filters interface
interface AdvancedFilters {
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  locations: string[];
}

const Properties = () => {
  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters | null>(null);
  
  // View and selected property state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeView, setActiveView] = useState("properties");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Adjust based on your UI

  // Get properties from the custom hook
  const { 
    properties, 
    isLoading, 
    error, 
    fetchProperties, 
    addProperty, 
    updateProperty, 
    deleteProperty 
  } = useProperties();

  // Show error messages
  useEffect(() => {
    if (error) {
      toast.error('Failed to load properties', {
        description: error
      });
    }
  }, [error]);

  // Filter properties based on search, tab, and advanced filters
  const filteredProperties = properties.filter((property) => {
    // Basic search filtering
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "occupied" && property.status === "Occupied") ||
      (activeTab === "vacant" && property.status === "Vacant") ||
      (activeTab === "maintenance" && property.status === "Maintenance");

    // Advanced filtering
    let matchesAdvancedFilters = true;
    if (advancedFilters) {
      // Price range filter
      if (property.price < advancedFilters.priceRange[0] || 
          property.price > advancedFilters.priceRange[1]) {
        matchesAdvancedFilters = false;
      }
      
      // Bedrooms filter
      if (advancedFilters.bedrooms && 
          property.bedrooms.toString() !== advancedFilters.bedrooms) {
        if (advancedFilters.bedrooms === "6+" && property.bedrooms < 6) {
          matchesAdvancedFilters = false;
        } else if (advancedFilters.bedrooms !== "6+") {
          matchesAdvancedFilters = false;
        }
      }
      
      // Bathrooms filter
      if (advancedFilters.bathrooms && 
          property.bathrooms.toString() !== advancedFilters.bathrooms) {
        if (advancedFilters.bathrooms === "5+" && property.bathrooms < 5) {
          matchesAdvancedFilters = false;
        } else if (advancedFilters.bathrooms !== "5+") {
          matchesAdvancedFilters = false;
        }
      }
      
      // Property type filter
      if (advancedFilters.propertyType && property.type !== advancedFilters.propertyType) {
        matchesAdvancedFilters = false;
      }
    }

    return matchesSearch && matchesTab && matchesAdvancedFilters;
  });

  // Paging logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, advancedFilters]);

  // Action handlers
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

  const handleAdvancedFilters = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
  };

  // Conditional rendering for different views
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
    <div className="space-y-8">
      {/* Header section */}
      <PropertyHeader onAddProperty={handleAddProperty} />
      
      {/* Filters section */}
      <PropertyFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAdvancedFilters={handleAdvancedFilters}
        activeFiltersCount={advancedFilters ? Object.values(advancedFilters).filter(v => 
          Array.isArray(v) ? v.length > 0 : v).length : 0}
      />

      {/* Property list section */}
      <PropertyList 
        properties={paginatedProperties}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onBookingManagement={handleBookingManagement}
        onPricingConfig={handlePricingConfig}
        onGuestManagement={handleGuestManagement}
        onDelete={handleDeleteProperty}
        onAddProperty={handleAddProperty}
      />
      
      {/* Pagination */}
      <PropertyPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      
      {/* Guesty Integration Section */}
      <div className="border-t pt-8">
        <GuestyPropertiesSection
          onViewDetails={handleViewDetails}
          onBookingManagement={handleBookingManagement}
          onPricingConfig={handlePricingConfig}
          onGuestManagement={handleGuestManagement}
          onDelete={handleDeleteProperty}
          onAddProperty={handleAddProperty}
        />
      </div>

      {/* Add Property Dialog */}
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
