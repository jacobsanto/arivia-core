
import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useRealProperties } from '@/hooks/useRealProperties';
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyStats } from "@/components/properties/PropertyStats";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { CreatePropertyDialog } from "@/components/properties/CreatePropertyDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Grid3X3, 
  List,
  Download,
  Settings
} from "lucide-react";

const Properties: React.FC = () => {
  const { properties, isLoading } = useRealProperties();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    return properties.filter(property => {
      const matchesSearch = searchQuery === "" || 
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;
      const matchesType = typeFilter === "all" || property.property_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchQuery, statusFilter, typeFilter]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (typeFilter !== "all") count++;
    return count;
  }, [statusFilter, typeFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const handleQuickAction = (propertyId: string, action: string) => {
    console.log(`Quick action: ${action} for property: ${propertyId}`);
    // Implement quick actions here
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
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
        <meta name="description" content="Manage and monitor all villa properties across the Arivia portfolio" />
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
              Manage and monitor all villa properties across the Arivia portfolio
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <PropertyStats properties={properties || []} />

        {/* Filters and Search */}
        <PropertyFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onCreateProperty={() => setIsCreateDialogOpen(true)}
          onClearFilters={handleClearFilters}
          activeFiltersCount={activeFiltersCount}
        />

        {/* View Tabs */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="rooms">Room Status</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onQuickAction={handleQuickAction}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onQuickAction={handleQuickAction}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="rooms">
            <RoomStatusManager />
          </TabsContent>
        </Tabs>

        {/* Properties Grid/List */}
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No properties found
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by adding your first property."}
              </p>
              {(!searchQuery && statusFilter === "all" && typeFilter === "all") && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Add First Property
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
          }>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        )}

        {/* Create Property Dialog */}
        <CreatePropertyDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </>
  );
};

export default Properties;
