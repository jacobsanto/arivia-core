
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, CleaningDefinition } from "@/types/housekeepingTypes";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { useToast } from "@/hooks/use-toast";

export const useHousekeepingTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("all");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [taskTypeOptions, setTaskTypeOptions] = useState<string[]>([]);
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const [cleaningDefinitions, setCleaningDefinitions] = useState<Record<string, string>>({});

  const { toast } = useToast();

  const fetchCleaningDefinitions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_cleaning_definitions');
        
      if (error) throw error;
      
      const definitions: Record<string, string> = {};
      if (data && Array.isArray(data)) {
        data.forEach((item: CleaningDefinition) => {
          definitions[item.task_type] = item.description;
        });
      }
      
      setCleaningDefinitions(definitions);
    } catch (error) {
      console.error('Error fetching cleaning definitions:', error);
    }
  };

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
      setFilteredTasks(formattedTasks);
        
      const uniqueTaskTypes = [...new Set(formattedTasks.map(task => task.task_type))];
      setTaskTypeOptions(uniqueTaskTypes);
        
      const uniqueStaff = [...new Set(formattedTasks.map(task => task.assigned_to).filter(Boolean))];
      setStaffOptions(uniqueStaff);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus as 'pending' | 'in-progress' | 'done' } 
            : task
        )
      );
      
      toast({
        title: "Task updated",
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAssignTask = async (taskId: string, staffMember: string) => {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update({ assigned_to: staffMember })
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, assigned_to: staffMember } 
            : task
        )
      );
      
      toast({
        title: "Task assigned",
        description: `Task assigned to ${staffMember}`,
      });
    } catch (error: any) {
      console.error('Error assigning task:', error);
      toast({
        title: "Error assigning task",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    let filtered = [...tasks];
    
    if (taskTypeFilter !== 'all') {
      filtered = filtered.filter(task => task.task_type === taskTypeFilter);
    }
    
    if (assignedToFilter !== 'all') {
      if (assignedToFilter === 'unassigned') {
        filtered = filtered.filter(task => !task.assigned_to);
      } else {
        filtered = filtered.filter(task => task.assigned_to === assignedToFilter);
      }
    }
    
    if (dateRange && dateRange.from) {
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.due_date);
        if (dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return taskDate >= startDate && taskDate <= endDate;
        }
        return taskDate >= startDate;
      });
    }
    
    setFilteredTasks(filtered);
  }, [tasks, taskTypeFilter, assignedToFilter, dateRange]);

  useEffect(() => {
    fetchTasks();
    fetchCleaningDefinitions();
    
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
    tasks: filteredTasks,
    loading,
    taskTypeFilter,
    setTaskTypeFilter,
    assignedToFilter,
    setAssignedToFilter,
    dateRange,
    setDateRange,
    taskTypeOptions,
    staffOptions,
    cleaningDefinitions,
    handleTaskStatusUpdate,
    handleAssignTask
  };
};
