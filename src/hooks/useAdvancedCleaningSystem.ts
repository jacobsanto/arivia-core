// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CleaningTemplate {
  id: string;
  name: string;
  description?: string;
  is_global: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  template_data: any;
}

export interface RuleCondition {
  id: string;
  rule_id: string;
  condition_type: string;
  operator: string;
  value: any;
  logical_operator: string;
  condition_order: number;
}

export interface RuleAction {
  id: string;
  rule_id: string;
  action_type: string;
  action_data: any;
  action_order: number;
  is_active: boolean;
}

export interface ConfigurationAssignment {
  id: string;
  template_id?: string;
  config_id?: string;
  listing_id: string;
  assigned_by?: string;
  assigned_at: string;
}

export interface EnhancedCleaningRule {
  id: string;
  rule_name: string;
  rule_description?: string;
  config_id: string;
  min_nights: number;
  max_nights: number;
  is_active: boolean;
  template_id?: string;
  rule_version: number;
  is_template: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export const useAdvancedCleaningSystem = () => {
  const [templates, setTemplates] = useState<CleaningTemplate[]>([]);
  const [rules, setRules] = useState<EnhancedCleaningRule[]>([]);
  const [assignments, setAssignments] = useState<ConfigurationAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('cleaning_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      toast({
        title: "Error Loading Templates",
        description: err instanceof Error ? err.message : 'Failed to load templates',
        variant: "destructive",
      });
    }
  };

  const fetchEnhancedRules = async () => {
    try {
      const { data: rulesData, error: rulesError } = await supabase
        .from('cleaning_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;

      // Fetch conditions and actions for each rule
      const enhancedRules = await Promise.all(
        (rulesData || []).map(async (rule) => {
          const [conditionsResult, actionsResult] = await Promise.all([
            supabase
              .from('rule_conditions')
              .select('*')
              .eq('rule_id', rule.id)
              .order('condition_order'),
            supabase
              .from('rule_actions')
              .select('*')
              .eq('rule_id', rule.id)
              .order('action_order')
          ]);

          return {
            ...rule,
            conditions: conditionsResult.data || [],
            actions: actionsResult.data || []
          };
        })
      );

      setRules(enhancedRules);
    } catch (err) {
      console.error('Error fetching enhanced rules:', err);
      toast({
        title: "Error Loading Rules",
        description: err instanceof Error ? err.message : 'Failed to load rules',
        variant: "destructive",
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('configuration_assignments')
        .select(`
          *,
          cleaning_templates(name),
          property_cleaning_configs(config_name),
          guesty_listings(title)
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      toast({
        title: "Error Loading Assignments",
        description: err instanceof Error ? err.message : 'Failed to load assignments',
        variant: "destructive",
      });
    }
  };

  const createTemplate = async (template: Omit<CleaningTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cleaning_templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data, ...prev]);
      toast({
        title: "Template Created",
        description: `Template "${template.name}" has been created successfully`,
      });
      
      return data;
    } catch (err) {
      console.error('Error creating template:', err);
      toast({
        title: "Error Creating Template",
        description: err instanceof Error ? err.message : 'Failed to create template',
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<CleaningTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('cleaning_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => prev.map(t => t.id === id ? data : t));
      toast({
        title: "Template Updated",
        description: "Template has been updated successfully",
      });
      
      return data;
    } catch (err) {
      console.error('Error updating template:', err);
      toast({
        title: "Error Updating Template",
        description: err instanceof Error ? err.message : 'Failed to update template',
        variant: "destructive",
      });
      throw err;
    }
  };

  const bulkAssignTemplate = async (templateId: string, listingIds: string[]) => {
    try {
      const assignments = listingIds.map(listingId => ({
        template_id: templateId,
        listing_id: listingId
      }));

      const { data, error } = await supabase
        .from('configuration_assignments')
        .upsert(assignments, { onConflict: 'template_id,listing_id' })
        .select();

      if (error) throw error;

      await fetchAssignments();
      toast({
        title: "Bulk Assignment Complete",
        description: `Template assigned to ${listingIds.length} properties`,
      });

      return data;
    } catch (err) {
      console.error('Error in bulk assignment:', err);
      toast({
        title: "Error in Bulk Assignment",
        description: err instanceof Error ? err.message : 'Failed to assign template',
        variant: "destructive",
      });
      throw err;
    }
  };

  const testRule = async (ruleId: string, testBookingData: any) => {
    try {
      const { data, error } = await supabase
        .rpc('evaluate_rule_conditions', {
          rule_uuid: ruleId,
          booking_data: testBookingData
        });

      if (error) throw error;

      // Save test result
      await supabase
        .from('rule_test_results')
        .insert([{
          rule_id: ruleId,
          test_booking_data: testBookingData,
          test_result: { passed: data, tested_at: new Date().toISOString() }
        }]);

      return data;
    } catch (err) {
      console.error('Error testing rule:', err);
      toast({
        title: "Error Testing Rule",
        description: err instanceof Error ? err.message : 'Failed to test rule',
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
          fetchTemplates(),
          fetchEnhancedRules(),
          fetchAssignments()
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
    fetchTemplates();
    fetchEnhancedRules();
    fetchAssignments();
  };

  return {
    templates,
    rules,
    assignments,
    loading,
    error,
    createTemplate,
    updateTemplate,
    bulkAssignTemplate,
    testRule,
    refetch
  };
};