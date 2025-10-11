
// @ts-nocheck

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTaskActions = () => {
  const { toast } = useToast();

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
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

  return {
    handleTaskStatusUpdate,
    handleAssignTask
  };
};
