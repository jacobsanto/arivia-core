
import React, { useState } from "react";
import { toast } from "sonner";
import { useUnifiedProperties } from "@/hooks/useUnifiedProperties";
import UnifiedPropertyHeader from "@/components/properties/UnifiedPropertyHeader";
import UnifiedPropertiesList from "@/components/properties/UnifiedPropertiesList";
import { PropertySearch } from "@/components/properties/PropertySearch";
import { PropertySort } from "@/components/properties/PropertySort";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GuestyStatusBadge } from "@/components/properties/GuestyStatusBadge";

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: integrationHealth } = useQuery({
    queryKey: ['integration-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_health')
        .select('*')
        .eq('provider', 'guesty')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const { 
    properties, 
    isLoading, 
    lastSynced,
    syncWithGuesty,
    currentSort,
    handleSort
  } = useUnifiedProperties(searchQuery);

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
      
      <div className="flex flex-col gap-4">
        <GuestyStatusBadge 
          status={integrationHealth?.status} 
          lastSynced={integrationHealth?.last_synced}
        />
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <PropertySearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
          <PropertySort onSortChange={handleSort} currentSort={currentSort} />
        </div>
      </div>

      <UnifiedPropertiesList 
        properties={properties}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Properties;
