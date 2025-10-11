
// @ts-nocheck

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/housekeepingTypes";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/services/logger";

export const useTaskFetching = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskTypeOptions, setTaskTypeOptions] = useState<string[]>([]);
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });
          
      if (error) throw error;
        
      const formattedTasks: Task[] = (data || []).map((task: any) => ({
        id: task.id,
        task_type: task.task_type || 'Standard Cleaning',
        due_date: task.due_date,
        listing_id: task.listing_id || '',
        status: (task.status as 'pending' | 'in-progress' | 'done') || 'pending',
        assigned_to: task.assigned_to || '',
        created_at: task.created_at,
        booking_id: task.booking_id || '',
        checklist: task.checklist || []
      }));
        
      setTasks(formattedTasks);
      
      const uniqueTaskTypes = [...new Set(formattedTasks.map(task => task.task_type))];
      setTaskTypeOptions(uniqueTaskTypes);
        
      const uniqueStaff = [...new Set(formattedTasks.map(task => task.assigned_to).filter(Boolean))];
      setStaffOptions(uniqueStaff);
    } catch (error: any) {
      logger.error('Error fetching tasks', { error });
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    const tasksSubscription = supabase
      .channel('housekeeping_tasks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'housekeeping_tasks',
      }, fetchTasks)
      .subscribe();
      
    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, []);

  return {
    tasks,
    loading,
    taskTypeOptions,
    staffOptions
  };
};
