
import { supabase } from "@/integrations/supabase/client";
import { TaskRecord } from "../types";

/**
 * Fetches maintenance tasks data from Supabase
 */
export const fetchMaintenanceTasks = async (selectedProperty: string, fromDateStr: string | null, toDateStr: string | null) => {
  let maintenanceQuery = supabase.from('maintenance_tasks').select('id, status, priority, due_date, title, property_id, location, description, assigned_to');
  
  // Apply property filter if not 'all'
  if (selectedProperty !== 'all') {
    maintenanceQuery = maintenanceQuery.eq('property_id', selectedProperty);
  }
  
  // Apply date range filter if available
  if (fromDateStr && toDateStr) {
    maintenanceQuery = maintenanceQuery.gte('due_date', fromDateStr).lte('due_date', toDateStr);
  }
  
  const { data: maintenanceData, error: maintenanceError } = await maintenanceQuery;
  
  if (maintenanceError) throw new Error(`Failed to fetch maintenance tasks: ${maintenanceError.message}`);
  
  // Count maintenance tasks by priority
  const totalMaintenance = maintenanceData?.length || 0;
  const criticalMaintenance = maintenanceData?.filter(m => m.priority === 'high' || m.priority === 'urgent').length || 0;
  const standardMaintenance = maintenanceData?.filter(m => m.priority === 'normal' || m.priority === 'low').length || 0;
  
  return {
    maintenanceData: maintenanceData as TaskRecord[],
    stats: {
      total: totalMaintenance,
      critical: criticalMaintenance,
      standard: standardMaintenance
    }
  };
};
