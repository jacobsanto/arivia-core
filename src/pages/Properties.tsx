
import React, { useState } from "react";
import { toast } from "sonner";
import { useUnifiedProperties } from "@/hooks/useUnifiedProperties";
import UnifiedPropertyHeader from "@/components/properties/UnifiedPropertyHeader";
import UnifiedPropertiesList from "@/components/properties/UnifiedPropertiesList";
import { PropertySearch } from "@/components/properties/PropertySearch";
import { PropertySort } from "@/components/properties/PropertySort";

const Properties = () => {
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  const { 
    properties, 
    isLoading, 
    lastSynced,
    syncWithGuesty,
    currentSort,
    handleSort
  } = useUnifiedProperties();

  // Filter properties based on search query
  const filteredProperties = searchQuery 
    ? properties.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : properties;

  const handleSync = async () => {
    try {
      await syncWithGuesty();
      toast.success("Properties synced successfully from Guesty");
    } catch (error) {
      toast.error("Failed to sync properties");
    }
  };

  return (
    <div className="space-y-8">
      <UnifiedPropertyHeader 
        onSync={handleSync} 
        isLoading={isLoading} 
        lastSynced={lastSynced} 
      />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <PropertySearch 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        <PropertySort onSortChange={handleSort} currentSort={currentSort} />
      </div>

      <UnifiedPropertiesList 
        properties={filteredProperties}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Properties;
