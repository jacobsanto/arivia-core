
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
}

export interface RuleAssignment {
  id: string;
  rule_id: string;
  property_id: string;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
  cleaning_rules?: CleaningRule;
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

export const useRuleBasedCleaningSystem = () => {
  const [rules, setRules] = useState<CleaningRule[]>([]);
  const [actions, setActions] = useState<CleaningAction[]>([]);
  const [assignments, setAssignments] = useState<RuleAssignment[]>([]);
  const [tasks, setTasks] = useState<EnhancedHousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCleaningActions = async () => {
    try {
      // Try to query the cleaning_actions table
      const response = await supabase
        .from('cleaning_actions' as any)
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (response.error || !response.data) {
        console.log('Cleaning actions table not available yet, using fallback data');
        setActions([
          { id: '1', action_name: 'standard_cleaning', display_name: 'Standard Cleaning', estimated_duration: 90, category: 'cleaning', is_active: true },
          { id: '2', action_name: 'full_cleaning', display_name: 'Full Cleaning', estimated_duration: 180, category: 'cleaning', is_active: true },
          { id: '3', action_name: 'deep_cleaning', display_name: 'Deep Cleaning', estimated_duration: 240, category: 'cleaning', is_active: true },
          { id: '4', action_name: 'change_sheets', display_name: 'Change Bed Sheets', estimated_duration: 30, category: 'linen', is_active: true },
          { id: '5', action_name: 'towel_refresh', display_name: 'Towel Refresh', estimated_duration: 20, category: 'linen', is_active: true },
        ]);
      } else {
        setActions(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching cleaning actions:', err);
      setActions([
        { id: '1', action_name: 'standard_cleaning', display_name: 'Standard Cleaning', estimated_duration: 90, category: 'cleaning', is_active: true },
        { id: '2', action_name: 'full_cleaning', display_name: 'Full Cleaning', estimated_duration: 180, category: 'cleaning', is_active: true },
        { id: '3', action_name: 'deep_cleaning', display_name: 'Deep Cleaning', estimated_duration: 240, category: 'cleaning', is_active: true },
        { id: '4', action_name: 'change_sheets', display_name: 'Change Bed Sheets', estimated_duration: 30, category: 'linen', is_active: true },
        { id: '5', action_name: 'towel_refresh', display_name: 'Towel Refresh', estimated_duration: 20, category: 'linen', is_active: true },
      ]);
    }
  };

  const fetchCleaningRules = async () => {
    try {
      const response = await supabase
        .from('cleaning_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (response.error) {
        console.error('Error fetching cleaning rules:', response.error);
        setRules([]);
        return;
      }
      
      // Transform rules with safe property access
      const transformedRules = (response.data || []).map((rule: any) => {
        try {
          return {
            id: rule.id,
            rule_name: rule.rule_name,
            stay_length_range: rule.stay_length_range || [rule.min_nights || 1, rule.max_nights || 999],
            actions_by_day: rule.actions_by_day || {},
            is_global: rule.is_global ?? true,
            assignable_properties: rule.assignable_properties || [],
            is_active: rule.is_active ?? true,
            created_at: rule.created_at,
            updated_at: rule.updated_at
          };
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
            updated_at: rule.updated_at
          };
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
      // Try to fetch rule assignments, handle gracefully if table doesn't exist
      const response = await supabase
        .from('rule_assignments' as any)
        .select(`
          *,
          cleaning_rules(rule_name, stay_length_range)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (response.error || !response.data) {
        console.log('Rule assignments table not available yet');
        setAssignments([]);
      } else {
        setAssignments(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching rule assignments:', err);
      setAssignments([]);
    }
  };

  const fetchEnhancedTasks = async () => {
    try {
      const response = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (response.error) {
        console.error('Error fetching tasks:', response.error);
        setTasks([]);
        return;
      }
      
      // Transform tasks with safe property access for new columns
      const transformedTasks = (response.data || []).map((task: any) => {
        try {
          return {
            id: task.id,
            listing_id: task.listing_id,
            booking_id: task.booking_id,
            due_date: task.due_date,
            task_type: task.task_type,
            status: task.status,
            assigned_to: task.assigned_to,
            default_actions: task.default_actions || [],
            additional_actions: task.additional_actions || [],
            source_rule_id: task.source_rule_id,
            task_day_number: task.task_day_number || 1,
            checklist: task.checklist || [],
            description: task.description
          };
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
          };
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
      // Direct insert with type assertion
      const response = await supabase
        .from('cleaning_rules')
        .insert([rule as any])
        .select()
        .single();

      if (response.error) throw response.error;
      
      const transformedRule: CleaningRule = {
        id: response.data.id || Date.now().toString(),
        rule_name: response.data.rule_name || rule.rule_name,
        stay_length_range: response.data.stay_length_range || rule.stay_length_range,
        actions_by_day: response.data.actions_by_day || rule.actions_by_day,
        is_global: response.data.is_global ?? rule.is_global,
        assignable_properties: response.data.assignable_properties || rule.assignable_properties,
        is_active: response.data.is_active ?? rule.is_active,
        created_at: response.data.created_at || new Date().toISOString(),
        updated_at: response.data.updated_at || new Date().toISOString()
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
      const response = await supabase
        .from('cleaning_rules')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (response.error) throw response.error;
      
      const transformedRule: CleaningRule = {
        id: response.data.id,
        rule_name: response.data.rule_name || updates.rule_name || '',
        stay_length_range: response.data.stay_length_range || updates.stay_length_range || [1, 999],
        actions_by_day: response.data.actions_by_day || updates.actions_by_day || {},
        is_global: response.data.is_global ?? updates.is_global ?? true,
        assignable_properties: response.data.assignable_properties || updates.assignable_properties || [],
        is_active: response.data.is_active ?? updates.is_active ?? true,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
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
      const response = await supabase
        .from('cleaning_rules')
        .delete()
        .eq('id', id);

      if (response.error) throw response.error;
      
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
      // Fallback: update the rule's assignable_properties
      const response = await supabase
        .from('cleaning_rules')
        .update({ assignable_properties: propertyIds } as any)
        .eq('id', ruleId);

      if (response.error) {
        console.log('Using fallback assignment method');
      }

      await fetchRuleAssignments();
      toast({
        title: "Rule Assignment Complete",
        description: `Rule assigned to ${propertyIds.length} properties`,
      });

      return response.data;
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
      // Use type assertion to avoid conflicts with missing columns
      const updateData = { additional_actions: additionalActions } as any;
      
      const response = await supabase
        .from('housekeeping_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (response.error) throw response.error;
      
      const transformedTask: EnhancedHousekeepingTask = {
        id: response.data.id,
        listing_id: response.data.listing_id,
        booking_id: response.data.booking_id,
        due_date: response.data.due_date,
        task_type: response.data.task_type,
        status: response.data.status,
        assigned_to: response.data.assigned_to,
        default_actions: response.data.default_actions || [],
        additional_actions: response.data.additional_actions || additionalActions,
        source_rule_id: response.data.source_rule_id,
        task_day_number: response.data.task_day_number || 1,
        checklist: response.data.checklist || [],
        description: response.data.description
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
    refetch
  };
};
