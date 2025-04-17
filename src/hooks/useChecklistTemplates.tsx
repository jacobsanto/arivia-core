
import { useState } from "react";
import { ChecklistTemplate, ChecklistTemplateFormValues } from "../types/checklistTypes";
import { initialChecklistTemplates } from "../data/checklistTemplateData";
import { toastService } from "@/services/toast";
import { v4 as uuidv4 } from "uuid";

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(initialChecklistTemplates);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleCreateTemplate = (data: ChecklistTemplateFormValues) => {
    // Generate a new unique ID
    const newId = uuidv4();

    const newTemplate: ChecklistTemplate = {
      id: newId,
      name: data.name,
      description: data.description,
      category: data.category,
      items: data.items.map((item, index) => ({ 
        id: index + 1, 
        title: item.title, 
        completed: false 
      })),
      createdBy: "Admin", // In a real app, this would be the current user
      createdAt: new Date().toISOString(),
      isDefault: false
    };
    
    setTemplates([...templates, newTemplate]);
    toastService.success(`Checklist template "${data.name}" created successfully!`);
  };

  const handleEditTemplate = (data: ChecklistTemplateFormValues) => {
    if (!data.id) return;
    
    const templateToEdit = templates.find(t => t.id === data.id);
    if (!templateToEdit) return;
    
    const updatedTemplate = {
      ...templateToEdit,
      name: data.name,
      description: data.description,
      category: data.category,
      items: data.items.map((item, index) => ({ 
        id: index + 1, 
        title: item.title, 
        completed: false 
      })),
      updatedAt: new Date().toISOString()
    };
    
    setTemplates(templates.map(t => 
      t.id === templateToEdit.id ? updatedTemplate : t
    ));
    
    toastService.success(`Checklist template "${data.name}" updated successfully!`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toastService.success("Checklist template deleted successfully!");
  };

  const getTemplateById = (id: string) => {
    return templates.find(t => t.id === id) || null;
  };

  return {
    templates,
    filteredTemplates,
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
