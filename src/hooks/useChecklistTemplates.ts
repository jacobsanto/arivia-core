
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";
import { ChecklistTemplate, ChecklistTemplateFormValues } from "@/types/checklistTemplates";
import { ChecklistItem } from "@/types/taskTypes";

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch all templates
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("checklist_templates")
        .select("*")
        .order("title");

      if (error) {
        throw error;
      }

      // Convert JSONB items to typed ChecklistItem[]
      const formattedTemplates = data.map(template => ({
        ...template,
        id: template.id,
        title: template.title,
        description: template.description,
        taskType: template.task_type,
        items: template.items as ChecklistItem[],
        createdBy: template.created_by,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        isActive: template.is_active
      }));

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toastService.error("Failed to load checklist templates");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new template
  const createTemplate = async (values: ChecklistTemplateFormValues) => {
    try {
      const { data, error } = await supabase.from("checklist_templates").insert([
        {
          title: values.title,
          description: values.description || null,
          task_type: values.taskType,
          items: values.items,
          is_active: values.isActive
        }
      ]).select();

      if (error) {
        throw error;
      }

      toastService.success("Template created successfully");
      await fetchTemplates();
      setIsCreateModalOpen(false);
      return data[0];
    } catch (error) {
      console.error("Error creating template:", error);
      toastService.error("Failed to create template");
      return null;
    }
  };

  // Update an existing template
  const updateTemplate = async (id: string, values: Partial<ChecklistTemplateFormValues>) => {
    try {
      const updateData: any = {};
      if (values.title !== undefined) updateData.title = values.title;
      if (values.description !== undefined) updateData.description = values.description || null;
      if (values.taskType !== undefined) updateData.task_type = values.taskType;
      if (values.items !== undefined) updateData.items = values.items;
      if (values.isActive !== undefined) updateData.is_active = values.isActive;

      const { error } = await supabase
        .from("checklist_templates")
        .update(updateData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      toastService.success("Template updated successfully");
      await fetchTemplates();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating template:", error);
      toastService.error("Failed to update template");
    }
  };

  // Delete a template
  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("checklist_templates")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toastService.success("Template deleted successfully");
      await fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toastService.error("Failed to delete template");
    }
  };

  // Get templates by task type
  const getTemplatesByType = (taskType: string): ChecklistTemplate[] => {
    return templates.filter(template => template.taskType === taskType && template.isActive);
  };

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    selectedTemplate,
    setSelectedTemplate,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByType
  };
};
