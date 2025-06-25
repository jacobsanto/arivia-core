
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches properties data from Supabase with unified property handling
 */
export const fetchPropertiesData = async (selectedProperty: string) => {
  try {
    // Fetch from both Guesty listings and local properties for unified view
    let guestyQuery = supabase.from('guesty_listings').select('id, title, status').eq('is_deleted', false);
    let localQuery = supabase.from('properties').select('id, name, status');
    
    // Apply property filter if not 'all'
    if (selectedProperty !== 'all') {
      guestyQuery = guestyQuery.eq('id', selectedProperty);
      localQuery = localQuery.eq('id', selectedProperty);
    }
    
    const [guestyResult, localResult] = await Promise.all([
      guestyQuery,
      localQuery
    ]);
    
    if (guestyResult.error) {
      console.warn("Failed to fetch Guesty properties:", guestyResult.error);
    }
    
    if (localResult.error) {
      console.warn("Failed to fetch local properties:", localResult.error);
    }
    
    // Combine and normalize property data
    const guestyProperties = (guestyResult.data || []).map(prop => ({
      id: prop.id,
      name: prop.title,
      status: prop.status || 'active'
    }));
    
    const localProperties = (localResult.data || []).map(prop => ({
      id: prop.id,
      name: prop.name,
      status: prop.status || 'active'
    }));
    
    const allProperties = [...guestyProperties, ...localProperties];
    
    // Normalize status values for consistent counting
    const normalizeStatus = (status: string) => {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes('occupied') || lowerStatus.includes('booked')) return 'occupied';
      if (lowerStatus.includes('vacant') || lowerStatus.includes('available')) return 'vacant';
      if (lowerStatus.includes('maintenance') || lowerStatus.includes('repair')) return 'maintenance';
      return 'vacant'; // Default to vacant
    };
    
    // Count properties by normalized status
    const totalProperties = allProperties.length || 0;
    const occupiedProperties = allProperties.filter(p => normalizeStatus(p.status) === 'occupied').length || 0;
    const vacantProperties = allProperties.filter(p => normalizeStatus(p.status) === 'vacant').length || 0;
    const maintenanceProperties = allProperties.filter(p => normalizeStatus(p.status) === 'maintenance').length || 0;
    
    return {
      propertiesData: allProperties,
      stats: {
        total: totalProperties,
        occupied: occupiedProperties,
        vacant: vacantProperties,
        maintenance: maintenanceProperties,
        available: Math.max(0, vacantProperties - maintenanceProperties)
      }
    };
  } catch (error) {
    console.error("Error fetching properties data:", error);
    throw new Error(`Failed to fetch properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
