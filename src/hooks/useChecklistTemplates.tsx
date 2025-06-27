
import { useState, useEffect } from 'react';
import { ChecklistTemplate } from '@/types/checklistTypes';
import { defaultChecklistTemplates } from '@/data/checklistTemplateData';

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(defaultChecklistTemplates);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTemplate = async (templateData: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: ChecklistTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: false
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
    templates: filteredTemplates,
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
