
import { useState } from "react";
import { ChecklistTemplate } from "@/types/checklistTypes";

/**
 * Custom hook to manage template dialogs in the admin checklists page
 */
export const useTemplateDialogs = () => {
  // Dialog visibility states
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUseTemplateOpen, setIsUseTemplateOpen] = useState(false);
  
  // Selection states
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState<ChecklistTemplate | null>(null);

  // Function to prepare template for editing
  const openEditTemplateDialog = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsEditTemplateOpen(true);
  };

  // Function to prepare template for deletion
  const openDeleteTemplateDialog = (templateId: number) => {
    setTemplateToDelete(templateId);
    setIsDeleteDialogOpen(false);
  };

  // Function to prepare template for use
  const openUseTemplateDialog = (template: ChecklistTemplate) => {
    setSelectedTemplateForUse(template);
    setIsUseTemplateOpen(true);
  };

  // Function to reset all dialog states
  const resetDialogs = () => {
    setIsCreateTemplateOpen(false);
    setIsEditTemplateOpen(false);
    setIsDeleteDialogOpen(false);
    setIsUseTemplateOpen(false);
    setSelectedTemplate(null);
    setTemplateToDelete(null);
    setSelectedTemplateForUse(null);
  };

  return {
    // Dialog visibility states
    isCreateTemplateOpen,
    setIsCreateTemplateOpen,
    isEditTemplateOpen,
    setIsEditTemplateOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isUseTemplateOpen,
    setIsUseTemplateOpen,
    
    // Selection states
    selectedTemplate,
    setSelectedTemplate,
    templateToDelete,
    setTemplateToDelete,
    selectedTemplateForUse,
    setSelectedTemplateForUse,
    
    // Helper functions
    openEditTemplateDialog,
    openDeleteTemplateDialog,
    openUseTemplateDialog,
    resetDialogs,
  };
};
