
import { useState, useEffect } from 'react';
import { ChecklistTemplate } from '@/types/checklistTypes';

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Simulate loading templates
    setTimeout(() => {
      setTemplates([]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateTemplate = async (templateData: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: ChecklistTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleEditTemplate = async (id: string, templateData: Partial<ChecklistTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, ...templateData, updatedAt: new Date().toISOString() }
        : template
    ));
  };

  const handleDeleteTemplate = async (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const getTemplateById = (id: string) => {
    return templates.find(template => template.id === id);
  };

  return {
    templates,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    handleCreateTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    getTemplateById
  };
};
