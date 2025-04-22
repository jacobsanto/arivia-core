
import React from "react";
import { toast } from "sonner";
import { useUnifiedProperties } from "@/hooks/useUnifiedProperties";
import UnifiedPropertyHeader from "@/components/properties/UnifiedPropertyHeader";
import UnifiedPropertiesList from "@/components/properties/UnifiedPropertiesList";
import { PropertySearch } from "@/components/properties/PropertySearch";
import { PropertySort } from "@/components/properties/PropertySort";

const Properties = () => {
  const { 
    properties, 
    isLoading, 
    lastSynced,
    syncWithGuesty,
    currentSort,
    handleSort
  } = useUnifiedProperties();

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
        <PropertySearch />
        <PropertySort onSortChange={handleSort} currentSort={currentSort} />
      </div>

      <UnifiedPropertiesList 
        properties={properties}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Properties;
