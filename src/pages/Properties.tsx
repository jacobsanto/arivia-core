
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDetailedProperties, usePropertyFiltering } from '@/hooks/useDetailedProperties';
import { PropertyGridView } from "@/components/properties/enhanced/PropertyGridView";
import { PropertyListView } from "@/components/properties/enhanced/PropertyListView";
import { PropertyAdvancedFilters } from "@/components/properties/enhanced/PropertyAdvancedFilters";
import { PropertyStatsEnhanced } from "@/components/properties/enhanced/PropertyStatsEnhanced";
import { CreatePropertyDialog } from "@/components/properties/CreatePropertyDialog";
import { RoomStatusManagerEnhanced } from "@/components/properties/enhanced/RoomStatusManagerEnhanced";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2 } from "lucide-react";

const Properties: React.FC = () => {
  const { properties, isLoading } = useDetailedProperties();
  const { 
    filters, 
    viewMode, 
    updateFilter, 
    updateViewMode, 
    clearFilters, 
    activeFiltersCount 
  } = usePropertyFiltering();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter properties based on current filters
  const filteredProperties = React.useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = filters.search === "" || 
        property.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.address.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === "all" || property.status === filters.status;
      const matchesRoomStatus = filters.room_status === "all" || property.room_status === filters.room_status;
      const matchesType = filters.property_type === "all" || property.property_type === filters.property_type;
      const matchesBedrooms = filters.bedrooms === "all" || 
        (filters.bedrooms === "4" ? property.num_bedrooms >= 4 : property.num_bedrooms.toString() === filters.bedrooms);
      const matchesIssues = !filters.has_issues || property.open_issues_count > 0;
      
      return matchesSearch && matchesStatus && matchesRoomStatus && matchesType && matchesBedrooms && matchesIssues;
    });
  }, [properties, filters]);

  const handleQuickAction = (propertyId: string, action: string) => {
    console.log(`Quick action: ${action} for property: ${propertyId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Properties Management - Arivia Villas</title>
        <meta name="description" content="Comprehensive property management system for Arivia Villas portfolio" />
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Properties Management
            </h1>
            <p className="text-muted-foreground">
              Digital asset catalog with operational integration and deep-dive property views
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <PropertyStatsEnhanced properties={properties} />

        {/* Advanced Filters */}
        <PropertyAdvancedFilters
          filters={filters}
          viewMode={viewMode}
          activeFiltersCount={activeFiltersCount}
          onFilterChange={updateFilter}
          onViewModeChange={updateViewMode}
          onClearFilters={clearFilters}
          onCreateProperty={() => setIsCreateDialogOpen(true)}
        />

        {/* View Tabs */}
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties ({filteredProperties.length})</TabsTrigger>
            <TabsTrigger value="rooms">Room Status Manager</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-6">
            {viewMode.mode === 'grid' ? (
              <PropertyGridView 
                properties={filteredProperties}
                onQuickAction={handleQuickAction}
              />
            ) : (
              <PropertyListView
                properties={filteredProperties}
                viewMode={viewMode}
                onViewModeChange={updateViewMode}
                onQuickAction={handleQuickAction}
              />
            )}
          </TabsContent>
          
          <TabsContent value="rooms" className="mt-6">
            <RoomStatusManagerEnhanced />
          </TabsContent>
        </Tabs>

        <CreatePropertyDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </>
  );
};

export default Properties;
