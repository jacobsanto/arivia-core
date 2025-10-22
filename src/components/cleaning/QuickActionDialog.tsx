import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";
import { AlertTriangle, Users, Calendar } from "lucide-react";
import { logger } from '@/services/logger';

interface QuickActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'emergency' | 'assignment' | 'schedule' | null;
}

export const QuickActionDialog: React.FC<QuickActionDialogProps> = ({
  isOpen,
  onOpenChange,
  actionType,
}) => {
  const [formData, setFormData] = useState({
    property: "",
    priority: "high",
    description: "",
    assignedTo: "",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const getActionConfig = () => {
    switch (actionType) {
      case 'emergency':
        return {
          title: 'Emergency Cleaning Request',
          icon: AlertTriangle,
          description: 'Schedule urgent cleaning for incoming guests',
          defaultPriority: 'high',
        };
      case 'assignment':
        return {
          title: 'Staff Assignment',
          icon: Users,
          description: 'Assign staff to properties for today',
          defaultPriority: 'medium',
        };
      case 'schedule':
        return {
          title: 'Schedule Review',
          icon: Calendar,
          description: 'Create or modify cleaning schedules',
          defaultPriority: 'medium',
        };
      default:
        return {
          title: 'Quick Action',
          icon: AlertTriangle,
          description: 'Create a new task',
          defaultPriority: 'medium',
        };
    }
  };

  const config = getActionConfig();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const taskType = actionType === 'emergency' ? 'Emergency Cleaning' : 
                       actionType === 'assignment' ? 'Staff Assignment' :
                       actionType === 'schedule' ? 'Schedule Review' : 'Quick Task';

      const { error } = await supabase
        .from('housekeeping_tasks')
        .insert({
          title: taskType,
          task_type: taskType,
          description: formData.description,
          status: 'pending',
          due_date: formData.dueDate || null,
          assigned_to: formData.assignedTo || null,
          property_id: formData.property || null,
        });

      if (error) throw error;

      toastService.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-activity'] });
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        property: "",
        priority: "high",
        description: "",
        assignedTo: "",
        dueDate: "",
      });
    } catch (error) {
      logger.error('Error creating task:', error);
      toastService.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!actionType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <config.icon className="h-5 w-5 text-primary" />
            {config.title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            {config.description}
          </div>

          <div>
            <Label htmlFor="property">Property (Optional)</Label>
            <Input
              id="property"
              value={formData.property}
              onChange={(e) => handleInputChange('property', e.target.value)}
              placeholder="e.g., Villa Aurora"
            />
          </div>

          <div>
            <Label htmlFor="description">Task Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={
                actionType === 'emergency' ? 'Describe the urgent cleaning needs...' :
                actionType === 'assignment' ? 'Describe the staff assignment requirements...' :
                'Describe the schedule changes needed...'
              }
              required
              rows={3}
            />
          </div>

          {actionType !== 'schedule' && (
            <div>
              <Label htmlFor="assignedTo">Assign To (Optional)</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="Staff member"
              />
            </div>
          )}

          <div>
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};