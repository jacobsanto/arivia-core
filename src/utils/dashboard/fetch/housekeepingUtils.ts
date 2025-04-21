
import { supabase } from "@/integrations/supabase/client";
import { TaskRecord } from "../types";

/**
 * Fetches housekeeping tasks data from Supabase
 */
export const fetchHousekeepingTasks = async (selectedProperty: string, fromDateStr: string | null, toDateStr: string | null) => {
  try {
    let tasksQuery = supabase.from('housekeeping_tasks').select(`
      id, status, due_date, 
      title, property_id, priority, assigned_to, description,
      task_type, listing_id, booking_id, cleaning_type, checklist
    `);
    
    // Apply property filter if not 'all'
    if (selectedProperty !== 'all') {
      // Try both property_id and listing_id for backwards compatibility
      if (selectedProperty.includes('-')) {
        tasksQuery = tasksQuery.eq('property_id', selectedProperty);
      } else {
        tasksQuery = tasksQuery.eq('listing_id', selectedProperty);
      }
    }
    
    // Apply date range filter if available
    if (fromDateStr && toDateStr) {
      tasksQuery = tasksQuery.gte('due_date', fromDateStr).lte('due_date', toDateStr);
    }
    
    const { data: tasksData, error: tasksError } = await tasksQuery;
    
    if (tasksError) throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
    
    // Map the data to ensure all required fields exist
    const mappedTasks = (tasksData || []).map(task => ({
      id: task.id,
      status: task.status,
      due_date: task.due_date,
      title: task.title || `${task.task_type || 'Cleaning'} Task`,
      property_id: task.property_id || task.listing_id,
      priority: task.priority || 'normal',
      assigned_to: task.assigned_to,
      description: task.description,
      task_type: task.task_type,
      cleaning_type: task.cleaning_type
    })) as TaskRecord[];
    
    // Count tasks by status
    const totalTasks = mappedTasks.length || 0;
    const completedTasks = mappedTasks.filter(t => t.status === 'completed').length || 0;
    const pendingTasks = mappedTasks.filter(t => t.status === 'pending').length || 0;
    const inProgressTasks = mappedTasks.filter(t => t.status === 'in_progress').length || 0;
    
    return {
      tasksData: mappedTasks,
      stats: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks
      }
    };
  } catch (error) {
    console.error("Error fetching housekeeping tasks:", error);
    throw error;
  }
};
