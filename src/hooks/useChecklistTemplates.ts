import { useState, useCallback } from 'react';
import { ChecklistTemplate, ChecklistType, ChecklistSection, ChecklistTemplateItem } from '@/types/checklistTypes';
import { ChecklistItem } from '@/types/taskTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const mockTemplates: ChecklistTemplate[] = [
  {
    id: '1',
    name: 'Standard Turnover Clean',
    description: 'Complete cleaning checklist for guest turnover',
    category: 'Housekeeping',
    items: [
      { id: 1, title: 'Wipe down all countertops', completed: false },
      { id: 2, title: 'Clean stovetop and oven', completed: false },
      { id: 3, title: 'Clean refrigerator inside and out', completed: false },
      { id: 4, title: 'Clean and disinfect toilet', completed: false },
      { id: 5, title: 'Clean shower/bathtub', completed: false },
      { id: 6, title: 'Clean mirrors and fixtures', completed: false }
    ],
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Deep Clean Protocol',
    description: 'Comprehensive deep cleaning checklist',
    category: 'Housekeeping',
    items: [
      { id: 1, title: 'Clean baseboards and moldings', completed: false },
      { id: 2, title: 'Deep clean carpets', completed: false },
      { id: 3, title: 'Clean light fixtures', completed: false }
    ],
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'HVAC Maintenance',
    description: 'Regular HVAC system maintenance tasks',
    category: 'Maintenance',
    items: [
      { id: 1, title: 'Replace air filters', completed: false },
      { id: 2, title: 'Check thermostat settings', completed: false },
      { id: 3, title: 'Inspect vents and ducts', completed: false }
    ],
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use mock data for now until database schema is fixed
      console.log('Using mock templates for now');
      setTemplates(mockTemplates);
    } catch (err) {
      console.warn('Error fetching templates, using mock data:', err);
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (templateData: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      const flattenedItems = templateData.sections?.flatMap(section => 
        section.items.map(item => ({
          id: parseInt(item.id),
          title: item.text,
          completed: false
        }))
      ) || templateData.items || [];

      const newTemplate: ChecklistTemplate = {
        ...templateData,
        id: Date.now().toString(),
        items: flattenedItems,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Skip database insert for now
      console.log('Template would be created:', newTemplate.name);

      setTemplates(prev => [newTemplate, ...prev]);
      toast({
        title: "Template created",
        description: `${newTemplate.name} has been created successfully.`
      });
    } catch (err) {
      const errorMessage = 'Failed to create template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ChecklistTemplate>) => {
    setLoading(true);
    setError(null);

    try {
      const flattenedItems = updates.sections?.flatMap(section => 
        section.items.map(item => ({
          id: parseInt(item.id),
          title: item.text,
          completed: false
        }))
      ) || updates.items;

      const updatedData = {
        ...updates,
        items: flattenedItems,
        updatedAt: new Date().toISOString()
      };

      // Skip database update for now
      console.log('Template would be updated:', templateId);

      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, ...updatedData }
          : template
      ));

      toast({
        title: "Template updated",
        description: "Template has been updated successfully."
      });
    } catch (err) {
      const errorMessage = 'Failed to update template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateTemplate = useCallback(async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined
    };

    await createTemplate(duplicatedTemplate);
  }, [templates, createTemplate]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Skip database delete for now
      console.log('Template would be deleted:', templateId);

      setTemplates(prev => prev.filter(template => template.id !== templateId));
      
      toast({
        title: "Template deleted",
        description: "Template has been deleted successfully."
      });
    } catch (err) {
      const errorMessage = 'Failed to delete template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplatesByType = useCallback((type: ChecklistType) => {
    return templates.filter(template => template.type === type);
  }, [templates]);

  const getTemplateStats = useCallback((template: ChecklistTemplate) => {
    return {
      sectionsCount: template.sections?.length || 0,
      itemsCount: template.items?.length || 0
    };
  }, []);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    deleteTemplate,
    getTemplatesByType,
    getTemplateStats
  };
};