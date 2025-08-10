// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CleaningAction {
  id: string;
  action_name: string;
  display_name: string;
  description?: string;
  estimated_duration: number;
  category: string;
  is_active: boolean;
}

export interface CleaningRule {
  id: string;
  rule_name: string;
  stay_length_range: number[];
  actions_by_day: Record<string, string[]>;
  is_global: boolean;
  assignable_properties: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  config_id: string;
  min_nights: number;
  max_nights: number;
}

export interface RuleAssignment {
  id: string;
  rule_id: string;
  property_id: string;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
  cleaning_rules?: {
    rule_name: string;
    stay_length_range: number[];
  };
}

export interface EnhancedHousekeepingTask {
  id: string;
  listing_id: string;
  booking_id: string;
  due_date: string;
  task_type: string;
  status: string;
  assigned_to?: string;
  default_actions: string[];
  additional_actions: string[];
  source_rule_id?: string;
  task_day_number: number;
  checklist: any[];
  description?: string;
}

// Type guard functions for safe JSON parsing
const isStringArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

const isActionsRecord = (value: any): value is Record<string, string[]> => {
  return value && typeof value === 'object' && !Array.isArray(value);
};

const isNumberArray = (value: any): value is number[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'number');
};

export const useRuleBasedCleaningSystem = () => {
  const [rules, setRules] = useState<CleaningRule[]>([]);
  const [actions, setActions] = useState<CleaningAction[]>([]);
  const [assignments, setAssignments] = useState<RuleAssignment[]>([]);
  const [tasks, setTasks] = useState<EnhancedHousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCleaningActions = async () => {
    try {
      const { data, error } = await supabase
        .from('cleaning_actions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        console.log('Cleaning actions table error:', error);
        // Fallback to default actions
        setActions([
          { id: '1', action_name: 'standard_cleaning', display_name: 'Standard Cleaning', estimated_duration: 90, category: 'cleaning', is_active: true },
          { id: '2', action_name: 'full_cleaning', display_name: 'Full Cleaning', estimated_duration: 180, category: 'cleaning', is_active: true },
          { id: '3', action_name: 'deep_cleaning', display_name: 'Deep Cleaning', estimated_duration: 240, category: 'cleaning', is_active: true },
          { id: '4', action_name: 'change_sheets', display_name: 'Change Bed Sheets', estimated_duration: 30, category: 'linen', is_active: true },
          { id: '5', action_name: 'towel_refresh', display_name: 'Towel Refresh', estimated_duration: 20, category: 'linen', is_active: true },
        ]);
        return;
      }
      
      setActions(data || []);
    } catch (err) {
      console.error('Error fetching cleaning actions:', err);
      setActions([]);
    }
  };

  const fetchCleaningRules = async () => {
    try {
      const { data, error } = await supabase
        .from('cleaning_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cleaning rules:', error);
        setRules([]);
        return;
      }
      
      // Transform rules with safe property access and type assertions
      const transformedRules = (data || []).map((rule: any) => {
        try {
          return {
            id: rule.id,
            rule_name: rule.rule_name,
            stay_length_range: isNumberArray(rule.stay_length_range) ? rule.stay_length_range : [rule.min_nights || 1, rule.max_nights || 999],
            actions_by_day: isActionsRecord(rule.actions_by_day) ? rule.actions_by_day : {},
            is_global: rule.is_global ?? true,
            assignable_properties: isStringArray(rule.assignable_properties) ? rule.assignable_properties : [],
            is_active: rule.is_active ?? true,
            created_at: rule.created_at,
            updated_at: rule.updated_at,
            config_id: rule.config_id || 'default',
            min_nights: rule.min_nights || 1,
            max_nights: rule.max_nights || 999
          } as CleaningRule;
        } catch (transformError) {
          console.warn('Error transforming rule:', rule, transformError);
          return {
            id: rule.id,
            rule_name: rule.rule_name || 'Unknown Rule',
            stay_length_range: [1, 999],
            actions_by_day: {},
            is_global: true,
            assignable_properties: [],
            is_active: rule.is_active ?? true,
            created_at: rule.created_at,
            updated_at: rule.updated_at,
            config_id: rule.config_id || 'default',
            min_nights: rule.min_nights || 1,
            max_nights: rule.max_nights || 999
          } as CleaningRule;
        }
      });
      
      setRules(transformedRules);
    } catch (err) {
      console.error('Error fetching cleaning rules:', err);
      setRules([]);
      toast({
        title: "Error Loading Rules",
        description: 'Failed to load cleaning rules - using fallback mode',
        variant: "destructive",
      });
    }
  };

  const fetchRuleAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('rule_assignments')
        .select(`
          id,
          rule_id,
          property_id,
          assigned_at,
          assigned_by,
          is_active,
          cleaning_rules(rule_name, stay_length_range)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.log('Rule assignments table error:', error);
        setAssignments([]);
        return;
      }
      
      // Transform assignments to match interface
      const transformedAssignments = (data || []).map((assignment: any) => ({
        id: assignment.id,
        rule_id: assignment.rule_id,
        property_id: assignment.property_id,
        assigned_at: assignment.assigned_at,
        assigned_by: assignment.assigned_by,
        is_active: assignment.is_active,
        cleaning_rules: assignment.cleaning_rules ? {
          rule_name: assignment.cleaning_rules.rule_name,
          stay_length_range: isNumberArray(assignment.cleaning_rules.stay_length_range) 
            ? assignment.cleaning_rules.stay_length_range 
            : [1, 999]
        } : undefined
      }));
      
      setAssignments(transformedAssignments);
    } catch (err) {
      console.error('Error fetching rule assignments:', err);
      setAssignments([]);
    }
  };

  const fetchEnhancedTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
        return;
      }
      
      // Transform tasks with safe property access for new columns
      const transformedTasks = (data || []).map((task: any) => {
        try {
          return {
            id: task.id,
            listing_id: task.listing_id,
            booking_id: task.booking_id,
            due_date: task.due_date,
            task_type: task.task_type,
            status: task.status,
            assigned_to: task.assigned_to,
            default_actions: isStringArray(task.default_actions) ? task.default_actions : [],
            additional_actions: isStringArray(task.additional_actions) ? task.additional_actions : [],
            source_rule_id: task.source_rule_id,
            task_day_number: task.task_day_number || 1,
            checklist: Array.isArray(task.checklist) ? task.checklist : [],
            description: task.description
          } as EnhancedHousekeepingTask;
        } catch (transformError) {
          console.warn('Error transforming task:', task, transformError);
          return {
            id: task.id,
            listing_id: task.listing_id,
            booking_id: task.booking_id,
            due_date: task.due_date,
            task_type: task.task_type,
            status: task.status,
            assigned_to: task.assigned_to,
            default_actions: [],
            additional_actions: [],
            source_rule_id: undefined,
            task_day_number: 1,
            checklist: [],
            description: undefined
          } as EnhancedHousekeepingTask;
        }
      });
      
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
      toast({
        title: "Error Loading Tasks",
        description: 'Failed to load tasks - using fallback mode',
        variant: "destructive",
      });
    }
  };

  const createCleaningRule = async (rule: Omit<CleaningRule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Use first available config_id or create a fallback
      let configId = rule.config_id;
      if (!configId) {
        const { data: configData } = await supabase
          .from('property_cleaning_configs')
          .select('id')
          .limit(1);
        configId = configData?.[0]?.id || crypto.randomUUID();
      }

      const { data, error } = await supabase
        .from('cleaning_rules')
        .insert([{
          rule_name: rule.rule_name,
          config_id: configId,
          stay_length_range: rule.stay_length_range,
          actions_by_day: rule.actions_by_day,
          is_global: rule.is_global,
          assignable_properties: rule.assignable_properties,
          is_active: rule.is_active,
          min_nights: rule.min_nights,
          max_nights: rule.max_nights
        }])
        .select()
        .single();

      if (error) throw error;
      
      const transformedRule: CleaningRule = {
        id: data.id,
        rule_name: data.rule_name,
        stay_length_range: isNumberArray(data.stay_length_range) ? data.stay_length_range : rule.stay_length_range,
        actions_by_day: isActionsRecord(data.actions_by_day) ? data.actions_by_day : rule.actions_by_day,
        is_global: data.is_global ?? rule.is_global,
        assignable_properties: isStringArray(data.assignable_properties) ? data.assignable_properties : rule.assignable_properties,
        is_active: data.is_active ?? rule.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        config_id: data.config_id,
        min_nights: data.min_nights || rule.min_nights,
        max_nights: data.max_nights || rule.max_nights
      };
      
      setRules(prev => [transformedRule, ...prev]);
      toast({
        title: "Rule Created",
        description: `Rule "${rule.rule_name}" has been created successfully`,
      });
      
      return transformedRule;
    } catch (err) {
      console.error('Error creating rule:', err);
      toast({
        title: "Error Creating Rule",
        description: err instanceof Error ? err.message : 'Failed to create rule',
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateCleaningRule = async (id: string, updates: Partial<CleaningRule>) => {
    try {
      const { data, error } = await supabase
        .from('cleaning_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const transformedRule: CleaningRule = {
        id: data.id,
        rule_name: data.rule_name,
        stay_length_range: isNumberArray(data.stay_length_range) ? data.stay_length_range : updates.stay_length_range || [1, 999],
        actions_by_day: isActionsRecord(data.actions_by_day) ? data.actions_by_day : updates.actions_by_day || {},
        is_global: data.is_global ?? updates.is_global ?? true,
        assignable_properties: isStringArray(data.assignable_properties) ? data.assignable_properties : updates.assignable_properties || [],
        is_active: data.is_active ?? updates.is_active ?? true,
        created_at: data.created_at,
        updated_at: data.updated_at,
        config_id: data.config_id,
        min_nights: data.min_nights || 1,
        max_nights: data.max_nights || 999
      };
      
      setRules(prev => prev.map(r => r.id === id ? transformedRule : r));
      toast({
        title: "Rule Updated",
        description: "Rule has been updated successfully",
      });
      
      return transformedRule;
    } catch (err) {
      console.error('Error updating rule:', err);
      toast({
        title: "Error Updating Rule",
        description: err instanceof Error ? err.message : 'Failed to update rule',
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteCleaningRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cleaning_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRules(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Rule Deleted",
        description: "Rule has been deleted successfully",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting rule:', err);
      toast({
        title: "Error Deleting Rule",
        description: err instanceof Error ? err.message : 'Failed to delete rule',
        variant: "destructive",
      });
      throw err;
    }
  };

  const assignRuleToProperties = async (ruleId: string, propertyIds: string[]) => {
    try {
      // Get current user first
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // First, remove existing assignments for this rule
      await supabase
        .from('rule_assignments')
        .delete()
        .eq('rule_id', ruleId);

      // Then create new assignments
      if (propertyIds.length > 0) {
        const assignments = propertyIds.map(propertyId => ({
          rule_id: ruleId,
          property_id: propertyId,
          assigned_by: userId
        }));

        const { error } = await supabase
          .from('rule_assignments')
          .insert(assignments);

        if (error) throw error;
      }

      await fetchRuleAssignments();
      toast({
        title: "Rule Assignment Complete",
        description: `Rule assigned to ${propertyIds.length} properties`,
      });

      return true;
    } catch (err) {
      console.error('Error assigning rule:', err);
      toast({
        title: "Error Assigning Rule",
        description: err instanceof Error ? err.message : 'Failed to assign rule',
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateTaskActions = async (taskId: string, additionalActions: string[]) => {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .update({ additional_actions: additionalActions })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      
      const transformedTask: EnhancedHousekeepingTask = {
        id: data.id,
        listing_id: data.listing_id,
        booking_id: data.booking_id,
        due_date: data.due_date,
        task_type: data.task_type,
        status: data.status,
        assigned_to: data.assigned_to,
        default_actions: isStringArray(data.default_actions) ? data.default_actions : [],
        additional_actions: isStringArray(data.additional_actions) ? data.additional_actions : [],
        source_rule_id: data.source_rule_id,
        task_day_number: data.task_day_number || 1,
        checklist: Array.isArray(data.checklist) ? data.checklist : [],
        description: data.description
      };
      
      setTasks(prev => prev.map(t => t.id === taskId ? transformedTask : t));
      toast({
        title: "Task Updated",
        description: "Task actions have been updated successfully",
      });
      
      return transformedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: "Error Updating Task",
        description: err instanceof Error ? err.message : 'Failed to update task',
        variant: "destructive",
      });
      throw err;
    }
  };

  const createCleaningAction = async (actionData: Omit<CleaningAction, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('cleaning_actions')
        .insert([actionData])
        .select()
        .single();

      if (error) throw error;

      setActions(prev => [...prev, data]);
      toast({
        title: "Action Created",
        description: `Action "${actionData.display_name}" has been created successfully`,
      });
      
      return data;
    } catch (error) {
      console.error('Error creating cleaning action:', error);
      toast({
        title: "Error Creating Action",
        description: error instanceof Error ? error.message : 'Failed to create action',
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCleaningAction = async (actionData: CleaningAction) => {
    try {
      const { error } = await supabase
        .from('cleaning_actions')
        .update({
          action_name: actionData.action_name,
          display_name: actionData.display_name,
          description: actionData.description,
          category: actionData.category,
          estimated_duration: actionData.estimated_duration,
          is_active: actionData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', actionData.id);

      if (error) throw error;

      setActions(prev => prev.map(action => 
        action.id === actionData.id ? actionData : action
      ));
      
      toast({
        title: "Action Updated",
        description: `Action "${actionData.display_name}" has been updated successfully`,
      });
      
      return actionData;
    } catch (error) {
      console.error('Error updating cleaning action:', error);
      toast({
        title: "Error Updating Action",
        description: error instanceof Error ? error.message : 'Failed to update action',
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCleaningAction = async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('cleaning_actions')
        .update({ is_active: false })
        .eq('id', actionId);

      if (error) throw error;

      setActions(prev => prev.filter(action => action.id !== actionId));
      toast({
        title: "Action Deleted",
        description: "Action has been deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting cleaning action:', error);
      toast({
        title: "Error Deleting Action",
        description: error instanceof Error ? error.message : 'Failed to delete action',
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchCleaningActions(),
          fetchCleaningRules(),
          fetchRuleAssignments(),
          fetchEnhancedTasks()
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const refetch = () => {
    fetchCleaningActions();
    fetchCleaningRules();
    fetchRuleAssignments();
    fetchEnhancedTasks();
  };

  return {
    rules,
    actions,
    assignments,
    tasks,
    loading,
    error,
    createCleaningRule,
    updateCleaningRule,
    deleteCleaningRule,
    assignRuleToProperties,
    updateTaskActions,
    createCleaningAction,
    updateCleaningAction,
    deleteCleaningAction,
    refetch
  };
};
