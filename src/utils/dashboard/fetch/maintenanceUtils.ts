
import { supabase } from "@/integrations/supabase/client";
import { TaskRecord } from "../types";

/**
 * Fetches maintenance tasks data from Supabase with consistent property handling
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
  
  // Map maintenance data to consistent TaskRecord format
  const mappedMaintenanceTasks = (maintenanceData || []).map(task => {
    const mappedTask: TaskRecord = {
      id: task.id || '',
      status: task.status || 'pending',
      due_date: task.due_date || '',
      title: task.title || 'Maintenance Task',
      property_id: task.property_id || '',
      priority: task.priority || 'normal',
      assigned_to: task.assigned_to || null,
      description: task.description || '',
      location: task.location || ''
    };
    
    return mappedTask;
  });
  
  // Normalize priority values for consistent counting
  const normalizePriority = (priority: string) => {
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority.includes('high') || lowerPriority.includes('urgent') || lowerPriority.includes('critical')) return 'critical';
    return 'standard';
  };
  
  // Count maintenance tasks by normalized priority
  const totalMaintenance = mappedMaintenanceTasks.length || 0;
  const criticalMaintenance = mappedMaintenanceTasks.filter(m => normalizePriority(m.priority || 'normal') === 'critical').length || 0;
  const standardMaintenance = mappedMaintenanceTasks.filter(m => normalizePriority(m.priority || 'normal') === 'standard').length || 0;
  
  return {
    maintenanceData: mappedMaintenanceTasks,
    stats: {
      total: totalMaintenance,
      critical: criticalMaintenance,
      standard: standardMaintenance
    }
  };
};
