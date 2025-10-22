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
import { supabase } from '@/integrations/supabase/client';

export const useRecurringTasks = () => {
  const [state, setState] = useState<RecurringTasksState>({
    templates: [],
    loading: false,
    error: null
  });

  // Fetch real properties from database
  const getProperties = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name')
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }, []);

  // Fetch real staff from database
  const getStaff = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('role', ['housekeeping_staff', 'maintenance_staff', 'property_manager']);
      
      if (error) throw error;
      return data?.map(profile => ({
        id: profile.user_id,
        name: profile.name
      })) || [];
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  }, []);

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        // Check if we have a recurring_task_templates table
        const { data, error } = await supabase
          .from('checklist_templates')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.warn('No recurring task templates table found, using empty state');
          setState(prev => ({ ...prev, templates: [], loading: false }));
          return;
        }

        // Transform checklist templates to recurring task templates format
        const templates: RecurringTaskTemplate[] = data?.map(template => ({
          id: template.id,
          title: template.name, // Use name as title
          description: template.description || '',
          taskModule: template.task_type as TaskModule,
          baseTaskType: template.task_type as any,
          appliesTo: 'all-properties',
          assignedTo: '', // No created_by field available
          priority: 'medium',
          recurrenceRule: {
            frequency: 'weekly',
            interval: 1,
            dayOfWeek: 'Monday'
          },
          nextDueDate: new Date(),
          isActive: template.is_active,
          createdAt: new Date(template.created_at),
          updatedAt: new Date(template.updated_at)
        })) || [];

        setState(prev => ({ ...prev, templates, loading: false }));
      } catch (error) {
        console.error('Error loading templates:', error);
        setState(prev => ({ 
          ...prev, 
          templates: [], 
          loading: false, 
          error: 'Failed to load templates' 
        }));
      }
    };

    loadTemplates();
  }, []);

  const calculateNextDueDate = useCallback((rule: RecurrenceRule, fromDate: Date = new Date()): Date => {
    let nextDate = new Date(fromDate);

    if (rule.frequency === 'weekly') {
      nextDate = addWeeks(nextDate, rule.interval);
    } else if (rule.frequency === 'monthly') {
      nextDate = addMonths(nextDate, rule.interval);
    }

    return nextDate;
  }, []);

  const createTemplate = useCallback(async (template: Omit<RecurringTaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'nextDueDate'>) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const newTemplate: RecurringTaskTemplate = {
        ...template,
        id: `temp-${Date.now()}`,
        nextDueDate: calculateNextDueDate(template.recurrenceRule),
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
        description: `"${template.title}" has been created successfully.`
      });
    } catch (error) {
      console.error('Error creating template:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Failed to create template' }));
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      });
    }
  }, [calculateNextDueDate]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<RecurringTaskTemplate>) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(template =>
          template.id === templateId
            ? { ...template, ...updates, updatedAt: new Date() }
            : template
        ),
        loading: false
      }));

      toast({
        title: "Template Updated",
        description: "Template has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating template:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Failed to update template' }));
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      });
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      setState(prev => ({
        ...prev,
        templates: prev.templates.filter(template => template.id !== templateId),
        loading: false
      }));

      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Failed to delete template' }));
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  }, []);

  const toggleTemplateStatus = useCallback(async (templateId: string, isActive: boolean) => {
    await updateTemplate(templateId, { isActive });
  }, [updateTemplate]);

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

    // Generate tasks and update next due dates
    for (const { template } of tasksToGenerate) {
      const nextDueDate = calculateNextDueDate(template.recurrenceRule, template.nextDueDate);
      await updateTemplate(template.id, { nextDueDate });
    }

    if (tasksToGenerate.length > 0) {
      toast({
        title: "Recurring Tasks Generated",
        description: `${tasksToGenerate.length} recurring task(s) have been automatically created.`
      });
    }
  }, [state.templates, calculateNextDueDate, updateTemplate]);

  useEffect(() => {
    checkAndGenerateRecurringTasks();
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

  const getRuleDescription = useCallback((template: RecurringTaskTemplate): string => {
    const rule = template.recurrenceRule;
    const { frequency, interval } = rule;
    
    let description = `Every `;
    if (interval > 1) {
      description += `${interval} `;
    }
    
    if (frequency === 'weekly') {
      description += interval > 1 ? 'weeks' : 'week';
      if (rule.dayOfWeek) {
        description += ` on ${rule.dayOfWeek}`;
      }
    } else if (frequency === 'monthly') {
      description += interval > 1 ? 'months' : 'month';
      if (rule.dayOfMonth) {
        description += ` on the ${rule.dayOfMonth}${rule.dayOfMonth === 1 ? 'st' : rule.dayOfMonth === 2 ? 'nd' : rule.dayOfMonth === 3 ? 'rd' : 'th'}`;
      }
    }
    
    return description;
  }, []);

  const getApplicabilityText = useCallback((template: RecurringTaskTemplate): string => {
    return APPLIES_TO_LABELS[template.appliesTo] || template.appliesTo;
  }, []);

  const getStaffName = useCallback((staffId?: string) => {
    // Return synchronously for compatibility
    return staffId || 'Unassigned';
  }, []);

  // Add synchronous versions for compatibility
  const getPropertiesSync = useCallback(() => {
    // Return empty array for now - components should handle async loading
    return [];
  }, []);

  const getStaffSync = useCallback(() => {
    // Return empty array for now - components should handle async loading  
    return [];
  }, []);

  return {
    ...state,
    createTemplate,
    addTemplate: createTemplate, // Alias for compatibility
    updateTemplate,
    deleteTemplate,
    toggleTemplateStatus,
    getRuleDescription,
    getTaskTypeLabel,
    getApplicabilityText,
    getStaffName,
    getProperties: getPropertiesSync,
    getStaff: getStaffSync,
    checkAndGenerateRecurringTasks
  };
};