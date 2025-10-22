import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toastService } from "@/services/toast";

interface CreateTaskModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    task_type: '',
    description: '',
    property_id: '',
    assigned_to: '',
    priority: 'medium',
    due_date: undefined as Date | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch properties for selection
  const { data: properties = [] } = useQuery({
    queryKey: ['properties-for-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('id, nickname')
        .eq('active', true)
        .order('nickname');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Task type options
  const taskTypes = [
    'Standard Cleaning',
    'Deep Cleaning',
    'Check-in Preparation',
    'Check-out Cleaning',
    'Maintenance Cleaning',
    'Emergency Cleaning',
    'Laundry Service',
    'Inventory Check'
  ];

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.task_type || !formData.due_date) {
      toastService.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .insert({
          task_type: formData.task_type,
          description: formData.description || null,
          property_id: formData.property_id || null,
          assigned_to: formData.assigned_to || null,
          priority: formData.priority,
          due_date: formData.due_date.toISOString().split('T')[0],
          status: 'pending',
          title: formData.task_type, // Use task_type as title
        });

      if (error) throw error;

      // Reset form
      setFormData({
        task_type: '',
        description: '',
        property_id: '',
        assigned_to: '',
        priority: 'medium',
        due_date: undefined,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['housekeeping-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-calendar'] });

      toastService.success('Task created successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toastService.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Housekeeping Task</DialogTitle>
          <DialogDescription>
            Schedule a new cleaning task for your property
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Type */}
          <div>
            <Label htmlFor="task_type">Task Type *</Label>
            <Select 
              value={formData.task_type} 
              onValueChange={(value) => handleInputChange('task_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property */}
          <div>
            <Label htmlFor="property_id">Property</Label>
            <Select 
              value={formData.property_id} 
              onValueChange={(value) => handleInputChange('property_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property (optional)" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.nickname || `Property ${property.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div>
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? (
                    format(formData.due_date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => handleInputChange('due_date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleInputChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To */}
          <div>
            <Label htmlFor="assigned_to">Assign To (Email)</Label>
            <Input
              id="assigned_to"
              type="email"
              placeholder="staff@example.com"
              value={formData.assigned_to}
              onChange={(e) => handleInputChange('assigned_to', e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional task details or special instructions..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};