
import { supabase } from "@/integrations/supabase/client";
import { TaskRecord } from "../types";
import { toast } from "sonner";

/**
 * Fetches housekeeping tasks data from Supabase
 */
export const fetchHousekeepingTasks = async (selectedProperty: string, fromDateStr: string | null, toDateStr: string | null) => {
  try {
    // Use a simpler select that only includes fields we know exist in the table
    let query = supabase.from('housekeeping_tasks').select('*');
    
    // Apply property filter if not 'all'
    if (selectedProperty !== 'all') {
      if (selectedProperty && selectedProperty !== '') {
        // Try both property_id and listing_id for backwards compatibility
        query = query.or(`property_id.eq.${selectedProperty},listing_id.eq.${selectedProperty}`);
      }
    }
    
    // Apply date range filter if available
    if (fromDateStr && toDateStr) {
      query = query.gte('due_date', fromDateStr).lte('due_date', toDateStr);
    }
    
    // Execute the query
    const { data: tasksData, error: tasksError } = await query;
    
    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
    }
    
    // If we get here, tasksData is an array of records or null
    if (!tasksData || tasksData.length === 0) {
      return {
        tasksData: [],
        stats: { total: 0, completed: 0, pending: 0, inProgress: 0 }
      };
    }
    
    // Map the data to ensure all required fields exist
    // Use safe type assertions and default values to handle potential missing fields
    const mappedTasks = tasksData.map(task => {
      // Convert the raw database record to our TaskRecord type with safe defaults
      const mappedTask: TaskRecord = {
        id: task.id || '',
        status: task.status || 'pending',
        due_date: task.due_date || '',
        title: task.title || task.task_type || 'Cleaning Task',
        property_id: task.property_id || task.listing_id || '',
        priority: task.priority || 'normal',
        assigned_to: task.assigned_to || null,
        description: task.description || '',
        task_type: task.task_type || 'cleaning',
        cleaning_type: task.cleaning_type || 'Standard'
      };
      
      return mappedTask;
    });
    
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
    toast.error("Failed to load housekeeping tasks");
    
    // Return empty data on error
    return {
      tasksData: [],
      stats: {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0
      }
    };
  }
};
