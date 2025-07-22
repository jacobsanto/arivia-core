
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
      // First try to fetch from the new cleaning_actions table
      const { data: actionsData, error: actionsError } = await supabase
        .from('cleaning_actions' as any)
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (actionsError) {
        console.log('Cleaning actions table not available yet, using fallback data');
        // Fallback to hardcoded actions if table doesn't exist
        setActions([
          { id: '1', action_name: 'standard_cleaning', display_name: 'Standard Cleaning', estimated_duration: 90, category: 'cleaning', is_active: true },
          { id: '2', action_name: 'full_cleaning', display_name: 'Full Cleaning', estimated_duration: 180, category: 'cleaning', is_active: true },
          { id: '3', action_name: 'deep_cleaning', display_name: 'Deep Cleaning', estimated_duration: 240, category: 'cleaning', is_active: true },
          { id: '4', action_name: 'change_sheets', display_name: 'Change Bed Sheets', estimated_duration: 30, category: 'linen', is_active: true },
          { id: '5', action_name: 'towel_refresh', display_name: 'Towel Refresh', estimated_duration: 20, category: 'linen', is_active: true },
        ]);
      } else {
        setActions(actionsData || []);
      }
    } catch (err) {
      console.error('Error fetching cleaning actions:', err);
      // Use fallback actions
      setActions([]);
    }
  };

  const fetchCleaningRules = async () => {
    try {
      const { data, error } = await supabase
        .from('cleaning_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our expected interface
      const transformedRules = (data || []).map((rule: any) => ({
        id: rule.id,
        rule_name: rule.rule_name,
        stay_length_range: rule.stay_length_range || [1, 999],
        actions_by_day: rule.actions_by_day || {},
        is_global: rule.is_global ?? true,
        assignable_properties: rule.assignable_properties || [],
        is_active: rule.is_active ?? true,
        created_at: rule.created_at,
        updated_at: rule.updated_at
      }));
      
      setRules(transformedRules);
    } catch (err) {
      console.error('Error fetching cleaning rules:', err);
      toast({
        title: "Error Loading Rules",
        description: err instanceof Error ? err.message : 'Failed to load cleaning rules',
        variant: "destructive",
      });
    }
  };

  const fetchRuleAssignments = async () => {
    try {
      // Try to fetch from rule_assignments table
      const { data, error } = await supabase
        .from('rule_assignments' as any)
        .select(`
          *,
          cleaning_rules(rule_name, stay_length_range)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.log('Rule assignments table not available yet');
        setAssignments([]);
      } else {
        setAssignments(data || []);
      }
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

      if (error) throw error;
      
      // Transform the data to match our expected interface
      const transformedTasks = (data || []).map((task: any) => ({
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
        checklist: task.checklist || []
      }));
      
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast({
        title: "Error Loading Tasks",
        description: err instanceof Error ? err.message : 'Failed to load tasks',
        variant: "destructive",
      });
    }
  };

  const createCleaningRule = async (rule: Omit<CleaningRule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cleaning_rules')
        .insert([{
          rule_name: rule.rule_name,
          stay_length_range: rule.stay_length_range,
          actions_by_day: rule.actions_by_day,
          is_global: rule.is_global,
          assignable_properties: rule.assignable_properties,
          is_active: rule.is_active
        }])
        .select()
        .single();

      if (error) throw error;
      
      const transformedRule: CleaningRule = {
        id: data.id,
        rule_name: data.rule_name,
        stay_length_range: data.stay_length_range || [1, 999],
        actions_by_day: data.actions_by_day || {},
        is_global: data.is_global ?? true,
        assignable_properties: data.assignable_properties || [],
        is_active: data.is_active ?? true,
        created_at: data.created_at,
        updated_at: data.updated_at
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
        .update({
          rule_name: updates.rule_name,
          stay_length_range: updates.stay_length_range,
          actions_by_day: updates.actions_by_day,
          is_global: updates.is_global,
          assignable_properties: updates.assignable_properties,
          is_active: updates.is_active
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const transformedRule: CleaningRule = {
        id: data.id,
        rule_name: data.rule_name,
        stay_length_range: data.stay_length_range || [1, 999],
        actions_by_day: data.actions_by_day || {},
        is_global: data.is_global ?? true,
        assignable_properties: data.assignable_properties || [],
        is_active: data.is_active ?? true,
        created_at: data.created_at,
        updated_at: data.updated_at
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

  const assignRuleToProperties = async (ruleId: string, propertyIds: string[]) => {
    try {
      // Try to insert into rule_assignments table
      const assignments = propertyIds.map(propertyId => ({
        rule_id: ruleId,
        property_id: propertyId
      }));

      const { data, error } = await supabase
        .from('rule_assignments' as any)
        .upsert(assignments, { onConflict: 'rule_id,property_id' })
        .select();

      if (error) {
        console.log('Rule assignments table not available, using alternative approach');
        // Alternative: Update the rule's assignable_properties directly
        const { error: updateError } = await supabase
          .from('cleaning_rules')
          .update({ assignable_properties: propertyIds })
          .eq('id', ruleId);
        
        if (updateError) throw updateError;
      }

      await fetchRuleAssignments();
      toast({
        title: "Rule Assignment Complete",
        description: `Rule assigned to ${propertyIds.length} properties`,
      });

      return data;
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
      
      const transformedTask = {
        id: data.id,
        listing_id: data.listing_id,
        booking_id: data.booking_id,
        due_date: data.due_date,
        task_type: data.task_type,
        status: data.status,
        assigned_to: data.assigned_to,
        default_actions: data.default_actions || [],
        additional_actions: data.additional_actions || [],
        source_rule_id: data.source_rule_id,
        task_day_number: data.task_day_number || 1,
        checklist: data.checklist || []
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
    assignRuleToProperties,
    updateTaskActions,
    refetch
  };
};
