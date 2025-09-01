import { useState, useCallback, useEffect } from 'react';
import { 
  RecurringTaskTemplate, 
  RecurringTasksState, 
  RecurrenceRule,
  TaskModule,
  HousekeepingTaskType,
  MaintenanceTaskType,
  HOUSEKEEPING_TASK_LABELS,
  MAINTENANCE_TASK_LABELS,
  APPLIES_TO_LABELS
} from '@/types/recurringTasks.types';
import { toast } from '@/hooks/use-toast';
import { addDays, addWeeks, addMonths, format, isAfter } from 'date-fns';

// Mock properties
const mockProperties = [
  { id: 'prop-1', name: 'Villa Caldera' },
  { id: 'prop-2', name: 'Villa Azure' },
  { id: 'prop-3', name: 'Villa Sunset' }
];

// Mock staff
const mockStaff = [
  { id: 'staff-1', name: 'Maria Kostas' },
  { id: 'staff-2', name: 'Nikos Stavros' },
  { id: 'staff-3', name: 'Elena Dimitriou' }
];

// Mock initial templates
const mockInitialTemplates: RecurringTaskTemplate[] = [
  {
    id: 'template-1',
    title: 'Weekly Pool Maintenance',
    description: 'Regular pool cleaning and chemical balance check',
    taskModule: 'maintenance',
    baseTaskType: 'pool-maintenance',
    appliesTo: 'properties-with-pools',
    assignedTo: 'staff-2',
    priority: 'medium',
    recurrenceRule: {
      frequency: 'weekly',
      interval: 1,
      dayOfWeek: 'Monday'
    },
    nextDueDate: new Date('2024-02-05'),
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'template-2',
    title: 'Monthly HVAC Inspection',
    description: 'Comprehensive HVAC system check and filter replacement',
    taskModule: 'maintenance',
    baseTaskType: 'hvac-maintenance',
    appliesTo: 'all-properties',
    assignedTo: 'staff-2',
    priority: 'high',
    recurrenceRule: {
      frequency: 'monthly',
      interval: 1,
      dayOfMonth: 15
    },
    nextDueDate: new Date('2024-02-15'),
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const useRecurringTasks = () => {
  const [state, setState] = useState<RecurringTasksState>({
    templates: mockInitialTemplates,
    loading: false,
    error: null
  });

  const calculateNextDueDate = useCallback((rule: RecurrenceRule, fromDate: Date = new Date()): Date => {
    let nextDate = new Date(fromDate);

    if (rule.frequency === 'weekly') {
      const targetDay = rule.dayOfWeek;
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = daysOfWeek.indexOf(targetDay || 'Monday');
      const currentDayIndex = nextDate.getDay();
      
      let daysUntilTarget = targetDayIndex - currentDayIndex;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
      }
      
      nextDate = addDays(nextDate, daysUntilTarget);
      if (rule.interval > 1) {
        nextDate = addWeeks(nextDate, (rule.interval - 1) * 7);
      }
    } else if (rule.frequency === 'monthly') {
      const targetDay = rule.dayOfMonth || 1;
      nextDate.setDate(targetDay);
      
      // If the target day has already passed this month, move to next month
      if (nextDate <= fromDate) {
        nextDate = addMonths(nextDate, 1);
      }
      
      if (rule.interval > 1) {
        nextDate = addMonths(nextDate, rule.interval - 1);
      }
    }

    return nextDate;
  }, []);

  const getRuleDescription = useCallback((template: RecurringTaskTemplate): string => {
    const rule = template.recurrenceRule;
    const intervalText = rule.interval === 1 ? 'Every' : `Every ${rule.interval}`;
    
    if (rule.frequency === 'weekly') {
      const frequencyText = rule.interval === 1 ? 'week' : 'weeks';
      return `${intervalText} ${frequencyText} on ${rule.dayOfWeek}`;
    } else {
      const frequencyText = rule.interval === 1 ? 'month' : 'months';
      const dayText = rule.dayOfMonth === 1 ? '1st' : 
                     rule.dayOfMonth === 2 ? '2nd' : 
                     rule.dayOfMonth === 3 ? '3rd' : 
                     `${rule.dayOfMonth}th`;
      return `${intervalText} ${frequencyText} on the ${dayText}`;
    }
  }, []);

  const addTemplate = useCallback(async (template: Omit<RecurringTaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'nextDueDate'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const nextDueDate = calculateNextDueDate(template.recurrenceRule);
      
      const newTemplate: RecurringTaskTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        nextDueDate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setState(prev => ({
        ...prev,
        templates: [...prev.templates, newTemplate],
        loading: false
      }));

      toast({
        title: "Template Created",
        description: "Recurring task template has been created successfully."
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to create template"
      }));
      
      toast({
        title: "Create Failed",
        description: "Failed to create recurring task template. Please try again.",
        variant: "destructive"
      });
    }
  }, [calculateNextDueDate]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<RecurringTaskTemplate>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        templates: prev.templates.map(template => {
          if (template.id === templateId) {
            const updatedTemplate = { ...template, ...updates, updatedAt: new Date() };
            
            // Recalculate next due date if recurrence rule changed
            if (updates.recurrenceRule) {
              updatedTemplate.nextDueDate = calculateNextDueDate(updates.recurrenceRule);
            }
            
            return updatedTemplate;
          }
          return template;
        }),
        loading: false
      }));

      toast({
        title: "Template Updated",
        description: "Recurring task template has been updated successfully."
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to update template"
      }));
      
      toast({
        title: "Update Failed",
        description: "Failed to update recurring task template. Please try again.",
        variant: "destructive"
      });
    }
  }, [calculateNextDueDate]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        templates: prev.templates.filter(template => template.id !== templateId),
        loading: false
      }));

      toast({
        title: "Template Deleted",
        description: "Recurring task template has been deleted successfully."
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to delete template"
      }));
      
      toast({
        title: "Delete Failed",
        description: "Failed to delete recurring task template. Please try again.",
        variant: "destructive"
      });
    }
  }, []);

  const toggleTemplateStatus = useCallback(async (templateId: string, isActive: boolean) => {
    await updateTemplate(templateId, { isActive });
  }, [updateTemplate]);

  // Background automation function
  const checkAndGenerateRecurringTasks = useCallback(async () => {
    const now = new Date();
    const tasksToGenerate: Array<{
      template: RecurringTaskTemplate;
      dueDate: Date;
    }> = [];

    // Check each active template
    state.templates.forEach(template => {
      if (template.isActive && isAfter(now, template.nextDueDate)) {
        tasksToGenerate.push({
          template,
          dueDate: template.nextDueDate
        });
      }
    });

    if (tasksToGenerate.length > 0) {
      console.log(`Generating ${tasksToGenerate.length} recurring tasks...`);
      
      // Here you would integrate with the actual task creation system
      for (const { template, dueDate } of tasksToGenerate) {
        // Create the actual task in housekeeping or maintenance module
        console.log(`Creating ${template.taskModule} task: ${template.title} for ${format(dueDate, 'yyyy-MM-dd')}`);
        
        // Update the template's next due date
        const nextDueDate = calculateNextDueDate(template.recurrenceRule, dueDate);
        await updateTemplate(template.id, { nextDueDate });
      }
      
      toast({
        title: "Recurring Tasks Generated",
        description: `${tasksToGenerate.length} recurring task(s) have been automatically created.`
      });
    }
  }, [state.templates, calculateNextDueDate, updateTemplate]);

  // Run automation check on component mount and periodically
  useEffect(() => {
    checkAndGenerateRecurringTasks();
    
    // Set up periodic check (every hour)
    const interval = setInterval(checkAndGenerateRecurringTasks, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkAndGenerateRecurringTasks]);

  const getTaskTypeLabel = useCallback((taskModule: TaskModule, baseTaskType: HousekeepingTaskType | MaintenanceTaskType): string => {
    if (taskModule === 'housekeeping') {
      return HOUSEKEEPING_TASK_LABELS[baseTaskType as HousekeepingTaskType];
    } else {
      return MAINTENANCE_TASK_LABELS[baseTaskType as MaintenanceTaskType];
    }
  }, []);

  const getApplicabilityText = useCallback((template: RecurringTaskTemplate): string => {
    if (template.appliesTo === 'specific-property' && template.specificPropertyId) {
      const property = mockProperties.find(p => p.id === template.specificPropertyId);
      return property?.name || 'Unknown Property';
    }
    return APPLIES_TO_LABELS[template.appliesTo];
  }, []);

  const getStaffName = useCallback((staffId?: string): string => {
    if (!staffId) return 'Unassigned';
    const staff = mockStaff.find(s => s.id === staffId);
    return staff?.name || 'Unknown Staff';
  }, []);

  const getProperties = useCallback(() => mockProperties, []);
  const getStaff = useCallback(() => mockStaff, []);

  return {
    ...state,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateStatus,
    getRuleDescription,
    getTaskTypeLabel,
    getApplicabilityText,
    getStaffName,
    getProperties,
    getStaff,
    checkAndGenerateRecurringTasks
  };
};
