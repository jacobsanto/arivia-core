
import { useState, useEffect } from "react";
import { ChecklistTemplate, ChecklistTemplateFormValues } from "../types/checklistTypes";
import { toastService } from "@/services/toast";
import { checklistTemplatesService } from "@/services/checklistTemplates.service";

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const data = await checklistTemplatesService.getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
        toastService.error('Failed to load checklist templates');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getTemplatesByCategory = (category: string) => {
    return templates.filter(template => template.category === category);
  };

  const handleCreateTemplate = async (data: ChecklistTemplateFormValues) => {
    try {
      const newTemplate = await checklistTemplatesService.createTemplate(data);
      if (newTemplate) {
        setTemplates([...templates, newTemplate]);
        toastService.success(`Checklist template "${data.name}" created successfully!`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toastService.error('Failed to create checklist template');
    }
  };

  const handleEditTemplate = async (data: ChecklistTemplateFormValues) => {
    if (!data.id) return;
    
    try {
      const updatedTemplate = await checklistTemplatesService.updateTemplate(data);
      if (updatedTemplate) {
        setTemplates(templates.map(t => 
          t.id === updatedTemplate.id ? updatedTemplate : t
        ));
        toastService.success(`Checklist template "${data.name}" updated successfully!`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toastService.error('Failed to update checklist template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await checklistTemplatesService.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      toastService.success("Checklist template deleted successfully!");
    } catch (error) {
      console.error('Error deleting template:', error);
      toastService.error('Failed to delete checklist template');
    }
  };

  const getTemplateById = (id: string) => {
    return templates.find(t => t.id === id) || null;
  };

  return {
    templates,
    filteredTemplates,
    loading,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    handleCreateTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    getTemplatesByCategory,
    getTemplateById
  };
};
