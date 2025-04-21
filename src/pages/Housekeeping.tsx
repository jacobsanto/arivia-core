
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import HousekeepingKanban from "@/components/housekeeping/HousekeepingKanban";
import HousekeepingMobileView from "@/components/housekeeping/HousekeepingMobileView";
import HousekeepingFilters from "@/components/housekeeping/HousekeepingFilters";
import HousekeepingHeader from "@/components/housekeeping/HousekeepingHeader";
import { Task, CleaningDefinition } from "@/types/housekeepingTypes";
import { DateRange } from "@/components/reports/DateRangeSelector";

const HousekeepingDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>("kanban");
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("all");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [taskTypeOptions, setTaskTypeOptions] = useState<string[]>([]);
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const [cleaningDefinitions, setCleaningDefinitions] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const fetchCleaningDefinitions = async () => {
    try {
      // Explicitly type the RPC call with type parameters to match the SQL function
      const { data, error } = await supabase
        .rpc<CleaningDefinition[]>('get_cleaning_definitions');
        
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

  useEffect(() => {
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

    fetchTasks();
    fetchCleaningDefinitions();
    
    checkOverdueTasks();
    
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
  }, [toast]);
  
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
  
  const checkOverdueTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return task.status !== 'done' && dueDate < today;
    });
    
    const todayTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return task.status !== 'done' && dueDate.getTime() === today.getTime();
    });
    
    if (overdueTasks.length > 0) {
      toast({
        title: `${overdueTasks.length} Overdue Tasks`,
        description: "Some housekeeping tasks are past their due date.",
        variant: "destructive"
      });
    }
    
    if (todayTasks.length > 0) {
      toast({
        title: `${todayTasks.length} Tasks Due Today`,
        description: "You have housekeeping tasks scheduled for today.",
        variant: "default"
      });
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

  return (
    <div className="container mx-auto px-4 pb-20">
      <HousekeepingHeader />
      
      <div className="mb-6">
        <HousekeepingFilters 
          taskTypeFilter={taskTypeFilter}
          setTaskTypeFilter={setTaskTypeFilter}
          assignedToFilter={assignedToFilter}
          setAssignedToFilter={setAssignedToFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          taskTypeOptions={taskTypeOptions}
          staffOptions={staffOptions}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <h3 className="text-xl font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or create new housekeeping tasks
          </p>
        </div>
      ) : (
        <>
          {!isMobile && (
            <Tabs defaultValue="kanban" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="kanban">Kanban View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="kanban" className="min-h-[500px]">
                <HousekeepingKanban 
                  tasks={filteredTasks}
                  onStatusChange={handleTaskStatusUpdate}
                  onAssignTask={handleAssignTask}
                  cleaningDefinitions={cleaningDefinitions}
                />
              </TabsContent>
              
              <TabsContent value="list">
                <HousekeepingMobileView 
                  tasks={filteredTasks}
                  onStatusChange={handleTaskStatusUpdate}
                  onAssignTask={handleAssignTask}
                  cleaningDefinitions={cleaningDefinitions}
                  isActuallyMobile={false}
                />
              </TabsContent>
            </Tabs>
          )}
          
          {isMobile && (
            <HousekeepingMobileView 
              tasks={filteredTasks}
              onStatusChange={handleTaskStatusUpdate}
              onAssignTask={handleAssignTask}
              cleaningDefinitions={cleaningDefinitions}
              isActuallyMobile={true}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HousekeepingDashboard;
