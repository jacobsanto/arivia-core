import { useState, useCallback } from 'react';
import { ChecklistTemplate, ChecklistSection, ChecklistTemplateItem, ChecklistType } from '@/types/checklists.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const mockTemplates: ChecklistTemplate[] = [
  {
    id: '1',
    name: 'Standard Turnover Clean',
    title: 'Standard Turnover Clean',
    description: 'Complete cleaning checklist for guest turnover',
    type: 'housekeeping',
    category: 'Housekeeping',
    sections: [
      {
        id: 'section-1',
        title: 'Kitchen',
        order: 1,
        items: [
          { id: 'item-1', text: 'Wipe down all countertops', order: 1 },
          { id: 'item-2', text: 'Clean stovetop and oven', order: 2 },
          { id: 'item-3', text: 'Clean refrigerator inside and out', order: 3 }
        ]
      },
      {
        id: 'section-2',
        title: 'Bathrooms',
        order: 2,
        items: [
          { id: 'item-4', text: 'Clean and disinfect toilet', order: 1 },
          { id: 'item-5', text: 'Clean shower/bathtub', order: 2 },
          { id: 'item-6', text: 'Clean mirrors and fixtures', order: 3 }
        ]
      }
    ],
    items: [
      { id: 'item-1', text: 'Wipe down all countertops', order: 1 },
      { id: 'item-2', text: 'Clean stovetop and oven', order: 2 },
      { id: 'item-3', text: 'Clean refrigerator inside and out', order: 3 },
      { id: 'item-4', text: 'Clean and disinfect toilet', order: 4 },
      { id: 'item-5', text: 'Clean shower/bathtub', order: 5 },
      { id: 'item-6', text: 'Clean mirrors and fixtures', order: 6 }
    ],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Deep Clean Protocol',
    title: 'Deep Clean Protocol',
    description: 'Comprehensive deep cleaning for monthly maintenance',
    type: 'housekeeping',
    category: 'Housekeeping',
    sections: [
      {
        id: 'section-3',
        title: 'Living Areas',
        order: 1,
        items: [
          { id: 'item-7', text: 'Deep vacuum all carpets', order: 1 },
          { id: 'item-8', text: 'Clean all baseboards', order: 2 },
          { id: 'item-9', text: 'Dust ceiling fans and light fixtures', order: 3 }
        ]
      }
    ],
    items: [
      { id: 'item-7', text: 'Deep vacuum all carpets', order: 1 },
      { id: 'item-8', text: 'Clean all baseboards', order: 2 },
      { id: 'item-9', text: 'Dust ceiling fans and light fixtures', order: 3 }
    ],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'HVAC Maintenance Check',
    title: 'HVAC Maintenance Check',
    description: 'Monthly HVAC system inspection and maintenance',
    type: 'maintenance',
    category: 'Maintenance',
    sections: [
      {
        id: 'section-4',
        title: 'System Inspection',
        order: 1,
        items: [
          { id: 'item-10', text: 'Check air filter condition', order: 1 },
          { id: 'item-11', text: 'Inspect ductwork for damage', order: 2 },
          { id: 'item-12', text: 'Test thermostat functionality', order: 3 }
        ]
      }
    ],
    items: [
      { id: 'item-10', text: 'Check air filter condition', order: 1 },
      { id: 'item-11', text: 'Inspect ductwork for damage', order: 2 },
      { id: 'item-12', text: 'Test thermostat functionality', order: 3 }
    ],
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  }
];

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(mockTemplates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from Supabase, but use mock data as fallback
      const { data, error: fetchError } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.warn('Supabase fetch failed, using mock data:', fetchError);
        setTemplates(mockTemplates);
      } else if (data && data.length > 0) {
        // Transform Supabase data to our format
        const transformedTemplates: ChecklistTemplate[] = data.map(template => {
          const sections = Array.isArray(template.items) ? template.items as unknown as ChecklistSection[] : [];
          const flatItems = sections.flatMap(section => section.items || []);
          
          return {
            id: template.id,
            name: template.title,
            title: template.title,
            description: template.description,
            type: template.task_type as ChecklistType,
            category: template.task_type === 'housekeeping' ? 'Housekeeping' : 
                     template.task_type === 'maintenance' ? 'Maintenance' : 'Inspection',
            sections: sections,
            items: flatItems,
            isActive: template.is_active,
            createdBy: template.created_by,
            createdAt: new Date(template.created_at),
            updatedAt: new Date(template.updated_at)
          };
        });
        setTemplates(transformedTemplates);
      } else {
        setTemplates(mockTemplates);
      }
    } catch (err) {
      console.warn('Error fetching templates, using mock data:', err);
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (templateData: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const flatItems = templateData.sections.flatMap(section => section.items || []);
      
      const newTemplate: ChecklistTemplate = {
        ...templateData,
        id: `template-${Date.now()}`,
        name: templateData.title,
        items: flatItems,
        category: templateData.type === 'housekeeping' ? 'Housekeeping' : 
                 templateData.type === 'maintenance' ? 'Maintenance' : 'Inspection',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Try to save to Supabase
      try {
        const sectionsForDB = JSON.parse(JSON.stringify(newTemplate.sections));
        
        const { error: insertError } = await supabase
          .from('checklist_templates')
          .insert({
            title: newTemplate.title,
            description: newTemplate.description,
            task_type: newTemplate.type,
            items: sectionsForDB,
            is_active: newTemplate.isActive,
            created_by: 'current-user-id'
          });

        if (insertError) {
          console.warn('Supabase insert failed, using local state:', insertError);
        }
      } catch (dbError) {
        console.warn('Database operation failed, continuing with local state:', dbError);
      }

      setTemplates(prev => [newTemplate, ...prev]);
      
      toast({
        title: "Template Created",
        description: `${newTemplate.title} has been created successfully.`
      });
    } catch (err) {
      toast({
        title: "Creation Failed", 
        description: "Failed to create template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ChecklistTemplate>) => {
    setLoading(true);
    try {
      const flatItems = updates.sections?.flatMap(section => section.items || []) || [];
      
      const updatedTemplate = {
        ...updates,
        name: updates.title || updates.name,
        items: flatItems,
        category: updates.type ? (updates.type === 'housekeeping' ? 'Housekeeping' : 
                 updates.type === 'maintenance' ? 'Maintenance' : 'Inspection') : undefined,
        updatedAt: new Date()
      };

      // Try to update in Supabase
      try {
        const sectionsForDB = updatedTemplate.sections ? JSON.parse(JSON.stringify(updatedTemplate.sections)) : undefined;
        
        const { error: updateError } = await supabase
          .from('checklist_templates')
          .update({
            title: updatedTemplate.title || updatedTemplate.name,
            description: updatedTemplate.description,
            task_type: updatedTemplate.type,
            items: sectionsForDB,
            is_active: updatedTemplate.isActive,
            updated_at: updatedTemplate.updatedAt.toISOString()
          })
          .eq('id', templateId);

        if (updateError) {
          console.warn('Supabase update failed, using local state:', updateError);
        }
      } catch (dbError) {
        console.warn('Database operation failed, continuing with local state:', dbError);
      }

      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, ...updatedTemplate }
          : template
      ));

      toast({
        title: "Template Updated",
        description: "Template has been updated successfully."
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Failed to update template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateTemplate = useCallback(async (templateId: string) => {
    const originalTemplate = templates.find(t => t.id === templateId);
    if (!originalTemplate) return;

    const duplicatedTemplate: ChecklistTemplate = {
      ...originalTemplate,
      id: `template-${Date.now()}`,
      name: `${originalTemplate.name} (Copy)`,
      title: `${originalTemplate.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await createTemplate(duplicatedTemplate);
  }, [templates, createTemplate]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    setLoading(true);
    try {
      // Try to delete from Supabase
      try {
        const { error: deleteError } = await supabase
          .from('checklist_templates')
          .update({ is_active: false })
          .eq('id', templateId);

        if (deleteError) {
          console.warn('Supabase delete failed, using local state:', deleteError);
        }
      } catch (dbError) {
        console.warn('Database operation failed, continuing with local state:', dbError);
      }

      setTemplates(prev => prev.filter(template => template.id !== templateId));
      
      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully."
      });
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplatesByType = useCallback((type: ChecklistType) => {
    return templates.filter(template => template.type === type && template.isActive);
  }, [templates]);

  const getTemplateStats = useCallback((template: ChecklistTemplate) => {
    const sectionsCount = template.sections.length;
    const itemsCount = template.sections.reduce((total, section) => total + section.items.length, 0);
    return { sectionsCount, itemsCount };
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