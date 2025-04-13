
import { useState } from "react";
import { ChecklistTemplate, ChecklistTemplateFormValues } from "../types/checklistTypes";
import { initialChecklistTemplates } from "../data/checklistTemplateData";
import { toastService } from "@/services/toast";

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(initialChecklistTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
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
    const newTemplate: ChecklistTemplate = {
      id: Math.max(0, ...templates.map(t => t.id)) + 1,
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
    setIsCreateTemplateOpen(false);
    toastService.success(`Checklist template "${data.name}" created successfully!`);
  };

  const handleEditTemplate = (data: ChecklistTemplateFormValues) => {
    if (!selectedTemplate) return;
    
    const updatedTemplate = {
      ...selectedTemplate,
      name: data.name,
      description: data.description,
      category: data.category,
      items: data.items.map((item, index) => ({ 
        id: index + 1, 
        title: item.title, 
        completed: false 
      })),
    };
    
    setTemplates(templates.map(t => 
      t.id === selectedTemplate.id ? updatedTemplate : t
    ));
    
    setSelectedTemplate(null);
    setIsEditTemplateOpen(false);
    toastService.success(`Checklist template "${data.name}" updated successfully!`);
  };

  const handleDeleteTemplate = (templateId: number) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toastService.success("Checklist template deleted successfully!");
  };

  const selectTemplateForEdit = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setIsEditTemplateOpen(true);
    }
  };

  const getTemplateById = (id: number) => {
    return templates.find(t => t.id === id) || null;
  };

  return {
    templates,
    filteredTemplates,
    selectedTemplate,
    isCreateTemplateOpen,
    setIsCreateTemplateOpen,
    isEditTemplateOpen,
    setIsEditTemplateOpen,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    handleCreateTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    selectTemplateForEdit,
    getTemplatesByCategory,
    getTemplateById
  };
};
