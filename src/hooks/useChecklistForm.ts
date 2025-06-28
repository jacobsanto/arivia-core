
import { useState } from "react";
import { ChecklistTemplate, ChecklistTemplateFormValues } from "@/types/checklistTypes";
import { toastService } from "@/services/toast";

/**
 * Custom hook for managing checklist template form state and actions
 */
export const useChecklistForm = (
  templates: ChecklistTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<ChecklistTemplate[]>>
) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleCreateTemplate = (data: ChecklistTemplateFormValues) => {
    // Generate a new unique ID as string
    const maxId = Math.max(0, ...templates.map(t => parseInt(t.id))) + 1;
    const newId = maxId.toString();
    
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
      updatedAt: new Date().toISOString()
    };
    
    setTemplates(templates.map(t => 
      t.id === selectedTemplate.id ? updatedTemplate : t
    ));
    
    setSelectedTemplate(null);
    setIsEditTemplateOpen(false);
    toastService.success(`Checklist template "${data.name}" updated successfully!`);
  };

  const handleDeleteTemplate = () => {
    if (templateToDelete === null) return;
    
    setTemplates(templates.filter(t => t.id !== templateToDelete));
    setTemplateToDelete(null);
    setIsDeleteDialogOpen(false);
    toastService.success("Checklist template deleted successfully!");
  };

  const selectTemplateForEdit = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setIsEditTemplateOpen(true);
    }
  };

  const selectTemplateForDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteDialogOpen(true);
  };

  return {
    // Template form state
    selectedTemplate,
    isCreateTemplateOpen,
    setIsCreateTemplateOpen,
    isEditTemplateOpen,
    setIsEditTemplateOpen,
    
    // Delete dialog state
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    templateToDelete,
    
    // Form handlers
    handleCreateTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    selectTemplateForEdit,
    selectTemplateForDelete,
  };
};
