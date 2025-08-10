// @ts-nocheck
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MaintenanceCreationForm from "./forms/MaintenanceCreationForm";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";

interface CreateMaintenanceTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

export const CreateMaintenanceTaskDialog = ({ 
  isOpen, 
  onOpenChange,
  onTaskCreated 
}: CreateMaintenanceTaskDialogProps) => {
  const handleSubmit = async (data: any) => {
    try {
      // Get the first available property for maintenance tasks
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .limit(1);
      
      const propertyId = properties?.[0]?.id;
      
      if (!propertyId) {
        throw new Error('No properties available for task assignment');
      }

      const { error } = await supabase
        .from('maintenance_tasks')
        .insert({
          property_id: propertyId,
          title: data.title,
          description: data.description,
          priority: data.priority.toLowerCase(),
          due_date: data.dueDate,
          location: data.location,
          required_tools: data.requiredTools,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toastService.success(`Maintenance task "${data.title}" created successfully!`);
      onOpenChange(false);
      onTaskCreated?.();
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      toastService.error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Maintenance Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Maintenance Task</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <MaintenanceCreationForm 
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};