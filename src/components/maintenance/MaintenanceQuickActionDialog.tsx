import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast';
import { AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

interface MaintenanceQuickActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'emergency' | 'inspection' | 'scheduling' | null;
}

export const MaintenanceQuickActionDialog: React.FC<MaintenanceQuickActionDialogProps> = ({
  isOpen,
  onOpenChange,
  actionType,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'high',
    taskType: 'general',
    dueDate: '',
  });
  
  const queryClient = useQueryClient();

  const getActionConfig = () => {
    switch (actionType) {
      case 'emergency':
        return {
          title: 'Emergency Repair Request',
          description: 'Report urgent maintenance that needs immediate attention',
          icon: AlertTriangle,
          defaultTitle: 'Emergency Repair - ',
          defaultPriority: 'high',
          defaultTaskType: 'emergency_repair'
        };
      case 'inspection':
        return {
          title: 'Schedule Property Inspection',
          description: 'Plan routine property inspection and maintenance checks',
          icon: CheckCircle,
          defaultTitle: 'Property Inspection - ',
          defaultPriority: 'medium',
          defaultTaskType: 'inspection'
        };
      case 'scheduling':
        return {
          title: 'Schedule Maintenance Task',
          description: 'Plan and organize upcoming maintenance work',
          icon: Calendar,
          defaultTitle: 'Scheduled Maintenance - ',
          defaultPriority: 'medium',
          defaultTaskType: 'scheduled_maintenance'
        };
      default:
        return {
          title: 'Quick Action',
          description: 'Perform a quick maintenance action',
          icon: AlertTriangle,
          defaultTitle: '',
          defaultPriority: 'medium',
          defaultTaskType: 'general'
        };
    }
  };

  const actionConfig = getActionConfig();

  React.useEffect(() => {
    if (actionType) {
      setFormData(prev => ({
        ...prev,
        title: actionConfig.defaultTitle,
        priority: actionConfig.defaultPriority,
        taskType: actionConfig.defaultTaskType,
      }));
    }
  }, [actionType, actionConfig.defaultTitle, actionConfig.defaultPriority, actionConfig.defaultTaskType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toastService.error('You must be logged in to create tasks');
        return;
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
        task_type: formData.taskType,
        status: 'pending' as const,
        due_date: formData.dueDate || null,
      };

      const { error } = await supabase
        .from('maintenance_tasks')
        .insert([taskData]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['maintenance-overview'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-recent-activity'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      
      toastService.success('Maintenance task created successfully!');
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        priority: 'high',
        taskType: 'general',
        dueDate: '',
      });
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      toastService.error('Failed to create maintenance task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActionIcon = actionConfig.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ActionIcon className="h-5 w-5" />
            {actionConfig.title}
          </DialogTitle>
          <DialogDescription>
            {actionConfig.description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the maintenance task..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select
                value={formData.taskType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, taskType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="appliance">Appliance</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="emergency_repair">Emergency Repair</SelectItem>
                  <SelectItem value="scheduled_maintenance">Scheduled Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};