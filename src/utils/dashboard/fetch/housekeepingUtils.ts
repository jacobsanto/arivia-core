
import { supabase } from "@/integrations/supabase/client";
import { TaskRecord } from "../types";

/**
 * Fetches housekeeping tasks data from Supabase
 */
export const fetchHousekeepingTasks = async (selectedProperty: string, fromDateStr: string | null, toDateStr: string | null) => {
  let tasksQuery = supabase.from('housekeeping_tasks').select('id, status, due_date, title, property_id, priority, assigned_to, description');
  
  // Apply property filter if not 'all'
  if (selectedProperty !== 'all') {
    tasksQuery = tasksQuery.eq('property_id', selectedProperty);
  }
  
  // Apply date range filter if available
  if (fromDateStr && toDateStr) {
    tasksQuery = tasksQuery.gte('due_date', fromDateStr).lte('due_date', toDateStr);
  }
  
  const { data: tasksData, error: tasksError } = await tasksQuery;
  
  if (tasksError) throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
  
  // Count tasks by status
  const totalTasks = tasksData?.length || 0;
  const completedTasks = tasksData?.filter(t => t.status === 'completed').length || 0;
  const pendingTasks = tasksData?.filter(t => t.status === 'pending').length || 0;
  const inProgressTasks = tasksData?.filter(t => t.status === 'in_progress').length || 0;
  
  return {
    tasksData: tasksData as TaskRecord[],
    stats: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks
    }
  };
};
