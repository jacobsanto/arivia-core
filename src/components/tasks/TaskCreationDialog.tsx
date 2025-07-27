import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskCreationForm from "./TaskCreationForm";
import MaintenanceCreationForm from "../maintenance/forms/MaintenanceCreationForm";
import { useTasks } from "@/hooks/useTasks";
import { useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/services/toast";
import { supabase } from "@/integrations/supabase/client";

interface TaskCreationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "housekeeping" | "maintenance";
}

export const TaskCreationDialog: React.FC<TaskCreationDialogProps> = ({
  isOpen,
  onOpenChange,
  defaultTab = "housekeeping"
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const queryClient = useQueryClient();
  
  // Get housekeeping task creation handlers
  const { 
    selectedTemplate, 
    handleCreateTask, 
    handleSelectTemplate 
  } = useTasks();

  const handleHousekeepingSubmit = async (data: any) => {
    await handleCreateTask(data);
    onOpenChange(false);
    // Refresh task data
    queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
  };

  const handleMaintenanceSubmit = async (data: any) => {
    try {
      // Get property ID from the properties table using the selected property name
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('name', data.property)
        .limit(1);
      
      const propertyId = properties?.[0]?.id;
      
      if (!propertyId) {
        throw new Error('Selected property not found');
      }
      
      // For now, store assignee as text since we don't have proper user profiles set up
      const assigneeText = data.assignee || 'Unassigned';
      
      // Create the maintenance task in database
      const { data: newTask, error } = await supabase
        .from('maintenance_tasks')
        .insert({
          property_id: propertyId,
          title: data.title,
          description: data.description,
          priority: data.priority.toLowerCase(),
          status: 'pending',
          due_date: data.dueDate,
          assigned_to: null, // Store as null for now, can be updated when user management is improved
          location: data.location,
          required_tools: data.requiredTools || ''
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toastService.success(`Maintenance task "${data.title}" created successfully!`);
      onOpenChange(false);
      
      // Refresh task data
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      toastService.error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "housekeeping" | "maintenance")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="housekeeping">Housekeeping Task</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Task</TabsTrigger>
          </TabsList>
          
          <TabsContent value="housekeeping" className="space-y-4">
            <TaskCreationForm 
              onSubmit={handleHousekeepingSubmit}
              onCancel={handleCancel}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
            />
          </TabsContent>
          
          <TabsContent value="maintenance" className="space-y-4">
            <MaintenanceCreationForm 
              onSubmit={handleMaintenanceSubmit}
              onCancel={handleCancel}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
