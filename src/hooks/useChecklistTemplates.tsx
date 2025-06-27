
import { useState, useEffect } from "react";
import { ChecklistTemplate, ChecklistItem } from "@/types/checklistTypes";
import { defaultChecklistTemplates } from "../data/checklistTemplateData";
import { toast } from "sonner";

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(defaultChecklistTemplates);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const createTemplate = async (templateData: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      // Convert form items to ChecklistItem format
      const items: ChecklistItem[] = templateData.items.map((item, index) => ({
        id: `${Date.now()}-${index}`,
        title: item.title,
        text: item.title, // Use title as text for consistency
        completed: false
      }));

      const newTemplate: ChecklistTemplate = {
        ...templateData,
        id: `template-${Date.now()}`,
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTemplates(prev => [...prev, newTemplate]);
      toast.success("Template created successfully!");
      return newTemplate;
    } catch (error) {
      toast.error("Failed to create template");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<ChecklistTemplate>) => {
    setIsLoading(true);
    try {
      const updatedTemplates = templates.map(template => {
        if (template.id === templateId) {
          // Convert form items to ChecklistItem format if items are being updated
          const items = updates.items ? updates.items.map((item, index) => ({
            id: `${Date.now()}-${index}`,
            title: item.title,
            text: item.title,
            completed: false
          })) : template.items;

          return {
            ...template,
            ...updates,
            items,
            updatedAt: new Date().toISOString()
          };
        }
        return template;
      });
      
      setTemplates(updatedTemplates);
      toast.success("Template updated successfully!");
    } catch (error) {
      toast.error("Failed to update template");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      toast.success("Template deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete template");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateById = (templateId: string) => {
    return templates.find(template => template.id === templateId);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handler functions to match AdminChecklists usage
  const handleCreateTemplate = async (templateData: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createTemplate(templateData);
  };

  const handleEditTemplate = async (templateId: string, updates: Partial<ChecklistTemplate>) => {
    return await updateTemplate(templateId, updates);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    return await deleteTemplate(templateId);
  };

  return {
    templates,
    setTemplates,
    filteredTemplates,
    isLoading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    handleCreateTemplate,
    handleEditTemplate,
    handleDeleteTemplate
  };
};
