import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { 
  RecurringTaskTemplate,
  TaskModule,
  HousekeepingTaskType,
  MaintenanceTaskType,
  TaskPriority,
  AppliesTo,
  RecurrenceFrequency,
  TASK_MODULE_LABELS,
  HOUSEKEEPING_TASK_LABELS,
  MAINTENANCE_TASK_LABELS,
  PRIORITY_LABELS,
  APPLIES_TO_LABELS,
  DAYS_OF_WEEK
} from '@/types/recurringTasks.types';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<RecurringTaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'nextDueDate'>) => Promise<void>;
  onUpdate?: (templateId: string, updates: Partial<RecurringTaskTemplate>) => Promise<void>;
  template?: RecurringTaskTemplate;
  properties: Array<{ id: string; name: string }>;
  staff: Array<{ id: string; name: string }>;
  isLoading: boolean;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  template,
  properties,
  staff,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: template?.title || '',
    description: template?.description || '',
    taskModule: template?.taskModule || '' as TaskModule | '',
    baseTaskType: template?.baseTaskType || '' as HousekeepingTaskType | MaintenanceTaskType | '',
    appliesTo: template?.appliesTo || '' as AppliesTo | '',
    specificPropertyId: template?.specificPropertyId || '',
    assignedTo: template?.assignedTo || '',
    priority: template?.priority || 'medium' as TaskPriority,
    checklistTemplateId: template?.checklistTemplateId || '',
    frequency: template?.recurrenceRule.frequency || 'weekly' as RecurrenceFrequency,
    interval: template?.recurrenceRule.interval || 1,
    dayOfWeek: template?.recurrenceRule.dayOfWeek || '',
    dayOfMonth: template?.recurrenceRule.dayOfMonth || 1,
    isActive: template?.isActive ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.taskModule || !formData.baseTaskType || !formData.appliesTo) return;
    
    const templateData: Omit<RecurringTaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'nextDueDate'> = {
      title: formData.title,
      description: formData.description,
      taskModule: formData.taskModule,
      baseTaskType: formData.baseTaskType,
      appliesTo: formData.appliesTo,
      specificPropertyId: formData.appliesTo === 'specific-property' ? formData.specificPropertyId : undefined,
      assignedTo: formData.assignedTo || undefined,
      priority: formData.priority,
      checklistTemplateId: formData.checklistTemplateId || undefined,
      recurrenceRule: {
        frequency: formData.frequency,
        interval: formData.interval,
        dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
        dayOfMonth: formData.frequency === 'monthly' ? formData.dayOfMonth : undefined
      },
      isActive: formData.isActive
    };

    if (template && onUpdate) {
      await onUpdate(template.id, templateData);
    } else {
      await onSave(templateData);
    }
    
    onClose();
  };

  const getTaskTypeOptions = () => {
    if (formData.taskModule === 'housekeeping') {
      return Object.entries(HOUSEKEEPING_TASK_LABELS);
    } else if (formData.taskModule === 'maintenance') {
      return Object.entries(MAINTENANCE_TASK_LABELS);
    }
    return [];
  };

  const isValid = formData.title && formData.taskModule && formData.baseTaskType && formData.appliesTo &&
    (formData.appliesTo !== 'specific-property' || formData.specificPropertyId) &&
    (formData.frequency === 'weekly' ? formData.dayOfWeek : formData.dayOfMonth);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Recurring Task Template' : 'Create New Recurring Task Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Define the Task */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 1: Define the Task</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Weekly Pool Maintenance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-module">Task Type *</Label>
                <Select
                  value={formData.taskModule}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    taskModule: value as TaskModule,
                    baseTaskType: '' // Reset base task type when module changes
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_MODULE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base-task-type">Base Task Type *</Label>
                <Select
                  value={formData.baseTaskType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, baseTaskType: value as any }))}
                  disabled={!formData.taskModule}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select base type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTaskTypeOptions().map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Step 2: Define Scope and Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 2: Define Scope and Assignment</h3>
            
            <div className="space-y-2">
              <Label htmlFor="applies-to">Applies To *</Label>
              <Select
                value={formData.appliesTo}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  appliesTo: value as AppliesTo,
                  specificPropertyId: '' // Reset property when scope changes
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(APPLIES_TO_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.appliesTo === 'specific-property' && (
              <div className="space-y-2">
                <Label htmlFor="specific-property">Select Property *</Label>
                <Select
                  value={formData.specificPropertyId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, specificPropertyId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assigned-to">Assigned To</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Step 3: Define Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 3: Define Schedule</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    frequency: value as RecurrenceFrequency,
                    dayOfWeek: '', // Reset timing when frequency changes
                    dayOfMonth: 1
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interval">Interval</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.interval}
                  onChange={(e) => setFormData(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                />
                <p className="text-xs text-muted-foreground">
                  Every X {formData.frequency === 'weekly' ? 'weeks' : 'months'}
                </p>
              </div>
            </div>

            {formData.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label htmlFor="day-of-week">Day of Week *</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dayOfWeek: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="day-of-month">Day of Month *</Label>
                <Input
                  id="day-of-month"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }))}
                />
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="is-active">Template is active</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};