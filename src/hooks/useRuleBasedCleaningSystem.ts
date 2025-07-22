
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
      const { data, error } = await supabase
        .from('cleaning_actions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setActions(data || []);
    } catch (err) {
      console.error('Error fetching cleaning actions:', err);
      toast({
        title: "Error Loading Actions",
        description: err instanceof Error ? err.message : 'Failed to load cleaning actions',
        variant: "destructive",
      });
    }
  };

  const fetchCleaningRules = async () => {
    try {
      const { data, error } = await supabase
        .from('cleaning_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
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
      const { data, error } = await supabase
        .from('rule_assignments')
        .select(`
          *,
          cleaning_rules(rule_name, stay_length_range)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching rule assignments:', err);
      toast({
        title: "Error Loading Assignments",
        description: err instanceof Error ? err.message : 'Failed to load rule assignments',
        variant: "destructive",
      });
    }
  };

  const fetchEnhancedTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
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
        .insert([rule])
        .select()
        .single();

      if (error) throw error;
      
      setRules(prev => [data, ...prev]);
      toast({
        title: "Rule Created",
        description: `Rule "${rule.rule_name}" has been created successfully`,
      });
      
      return data;
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
      
      setRules(prev => prev.map(r => r.id === id ? data : r));
      toast({
        title: "Rule Updated",
        description: "Rule has been updated successfully",
      });
      
      return data;
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
      const assignments = propertyIds.map(propertyId => ({
        rule_id: ruleId,
        property_id: propertyId
      }));

      const { data, error } = await supabase
        .from('rule_assignments')
        .upsert(assignments, { onConflict: 'rule_id,property_id' })
        .select();

      if (error) throw error;

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
      
      setTasks(prev => prev.map(t => t.id === taskId ? data : t));
      toast({
        title: "Task Updated",
        description: "Task actions have been updated successfully",
      });
      
      return data;
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
