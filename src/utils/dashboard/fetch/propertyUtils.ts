
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches properties data from Supabase
 */
export const fetchPropertiesData = async (selectedProperty: string) => {
  let propertiesQuery = supabase.from('properties').select('id, status');
  
  // Apply property filter if not 'all'
  if (selectedProperty !== 'all') {
    propertiesQuery = propertiesQuery.eq('id', selectedProperty);
  }
  
  const { data: propertiesData, error: propertiesError } = await propertiesQuery;
  
  if (propertiesError) throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
  
  // Count properties by status
  const totalProperties = propertiesData?.length || 0;
  const occupiedProperties = propertiesData?.filter(p => p.status === 'occupied').length || 0;
  const vacantProperties = propertiesData?.filter(p => p.status === 'vacant').length || 0;
  const maintenanceProperties = propertiesData?.filter(p => p.status === 'maintenance').length || 0;
  
  return {
    propertiesData,
    stats: {
      total: totalProperties,
      occupied: occupiedProperties,
      vacant: vacantProperties,
      maintenance: maintenanceProperties,
      available: vacantProperties - maintenanceProperties
    }
  };
};
