import { useState, useCallback } from 'react';
import { CleaningSettings, CleaningRule, ServiceLevelConfig, ChecklistTemplate, ServiceType, SERVICE_TYPE_LABELS } from '@/types/cleaningSettings.types';
import { toast } from '@/hooks/use-toast';

// Mock checklist templates
const mockChecklistTemplates: ChecklistTemplate[] = [
  {
    id: 'checklist-1',
    name: 'Standard Turnover Clean',
    type: 'housekeeping',
    description: 'Complete turnover cleaning checklist'
  },
  {
    id: 'checklist-2', 
    name: 'Quick Tidy Checklist',
    type: 'housekeeping',
    description: 'Mid-stay tidy and refresh'
  },
  {
    id: 'checklist-3',
    name: 'Deep Clean Protocol',
    type: 'housekeeping', 
    description: 'Comprehensive deep cleaning checklist'
  },
  {
    id: 'checklist-4',
    name: 'Linen Change Procedure',
    type: 'housekeeping',
    description: 'Standard linen and towel change'
  },
  {
    id: 'checklist-5',
    name: 'Checkout Cleaning',
    type: 'housekeeping',
    description: 'Post-guest departure cleaning'
  }
];

// Mock initial settings
const mockInitialSettings: CleaningSettings = {
  isAutomatedSchedulingEnabled: true,
  defaultCleaningTime: '11:00',
  rules: [
    {
      id: 'rule-1',
      name: 'Mid-stay Service for Extended Stays',
      minNights: 5,
      maxNights: 10,
      serviceType: 'mid-stay-tidy',
      frequency: 'once',
      dayOfStay: 4,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'rule-2', 
      name: 'Weekly Service for Long Stays',
      minNights: 11,
      serviceType: 'mid-stay-tidy',
      frequency: 'weekly',
      dayOfWeek: 'Wednesday',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],
  serviceLevelConfig: {
    'turnover-clean': 'checklist-1',
    'mid-stay-tidy': 'checklist-2',
    'deep-clean': 'checklist-3',
    'linen-change': 'checklist-4',
    'maintenance-clean': null,
    'guest-checkout-clean': 'checklist-5'
  }
};

export const useCleaningSettings = () => {
  const [settings, setSettings] = useState<CleaningSettings>(mockInitialSettings);
  const [loading, setLoading] = useState(false);

  const updateGeneralSettings = useCallback(async (updates: Partial<Pick<CleaningSettings, 'isAutomatedSchedulingEnabled' | 'defaultCleaningTime'>>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings(prev => ({
        ...prev,
        ...updates
      }));

      toast({
        title: "Settings Updated",
        description: "General cleaning settings have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addRule = useCallback(async (rule: Omit<CleaningRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newRule: CleaningRule = {
        ...rule,
        id: `rule-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setSettings(prev => ({
        ...prev,
        rules: [...prev.rules, newRule]
      }));

      toast({
        title: "Rule Added",
        description: "New cleaning rule has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Add Rule Failed",
        description: "Failed to add rule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRule = useCallback(async (ruleId: string, updates: Partial<CleaningRule>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSettings(prev => ({
        ...prev,
        rules: prev.rules.map(rule => 
          rule.id === ruleId 
            ? { ...rule, ...updates, updatedAt: new Date() }
            : rule
        )
      }));

      toast({
        title: "Rule Updated",
        description: "Cleaning rule has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update rule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRule = useCallback(async (ruleId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSettings(prev => ({
        ...prev,
        rules: prev.rules.filter(rule => rule.id !== ruleId)
      }));

      toast({
        title: "Rule Deleted",
        description: "Cleaning rule has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete rule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateServiceLevelConfig = useCallback(async (serviceType: ServiceType, checklistId: string | null) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setSettings(prev => ({
        ...prev,
        serviceLevelConfig: {
          ...prev.serviceLevelConfig,
          [serviceType]: checklistId
        }
      }));

      toast({
        title: "Service Level Updated",
        description: `Default checklist for ${SERVICE_TYPE_LABELS[serviceType]} has been updated.`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update service level configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getChecklistTemplates = useCallback((): ChecklistTemplate[] => {
    return mockChecklistTemplates.filter(template => template.type === 'housekeeping');
  }, []);

  const getRuleDescription = useCallback((rule: CleaningRule): string => {
    const stayRange = rule.maxNights 
      ? `${rule.minNights}-${rule.maxNights} nights`
      : `${rule.minNights}+ nights`;
    
    const serviceLabel = SERVICE_TYPE_LABELS[rule.serviceType];
    
    if (rule.frequency === 'once') {
      return `For stays of ${stayRange}, schedule a ${serviceLabel} once on day ${rule.dayOfStay}.`;
    } else {
      return `For stays of ${stayRange}, schedule a ${serviceLabel} weekly on ${rule.dayOfWeek}.`;
    }
  }, []);

  return {
    settings,
    loading,
    updateGeneralSettings,
    addRule,
    updateRule,
    deleteRule,
    updateServiceLevelConfig,
    getChecklistTemplates,
    getRuleDescription
  };
};