
import React from "react";
import { toast } from "sonner";
import { useUnifiedProperties } from "@/hooks/useUnifiedProperties";
import UnifiedPropertyHeader from "@/components/properties/UnifiedPropertyHeader";
import UnifiedPropertiesList from "@/components/properties/UnifiedPropertiesList";
import { PropertySearch } from "@/components/properties/PropertySearch";

const Properties = () => {
  const { 
    properties, 
    isLoading, 
    lastSynced,
    syncWithGuesty
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
      
      <PropertySearch />

      <UnifiedPropertiesList 
        properties={properties}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Properties;
