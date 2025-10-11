// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import { ChecklistTemplate, ChecklistTemplateFormValues } from "@/types/checklistTypes";

export const checklistTemplatesService = {
  async getTemplates(): Promise<ChecklistTemplate[]> {
    const { data, error } = await supabase
      .from('checklist_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching checklist templates:', error);
      throw error;
    }
    
    return data.map(template => ({
      id: template.id,
      name: template.title,
      description: template.description || '',
      category: template.task_type,
      items: (template.items as any) || [],
      createdBy: template.created_by || '',
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      isDefault: false
    }));
  },

  async createTemplate(formData: ChecklistTemplateFormValues): Promise<ChecklistTemplate | null> {
    const { data, error } = await supabase
      .from('checklist_templates')
      .insert({
        title: formData.name,
        description: formData.description,
        task_type: formData.category,
        items: formData.items.map((item, index) => ({
          id: index + 1,
          title: item.title,
          completed: false
        }))
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating checklist template:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.title,
      description: data.description || '',
      category: data.task_type,
      items: (data.items as any) || [],
      createdBy: data.created_by || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isDefault: false
    };
  },

  async updateTemplate(formData: ChecklistTemplateFormValues): Promise<ChecklistTemplate | null> {
    if (!formData.id) throw new Error('Template ID is required for updates');
    
    const { data, error } = await supabase
      .from('checklist_templates')
      .update({
        title: formData.name,
        description: formData.description,
        task_type: formData.category,
        items: formData.items.map((item, index) => ({
          id: index + 1,
          title: item.title,
          completed: false
        })),
        updated_at: new Date().toISOString()
      })
      .eq('id', formData.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating checklist template:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.title,
      description: data.description || '',
      category: data.task_type,
      items: (data.items as any) || [],
      createdBy: data.created_by || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isDefault: false
    };
  },

  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('checklist_templates')
      .update({ is_active: false })
      .eq('id', templateId);
    
    if (error) {
      console.error('Error deleting checklist template:', error);
      throw error;
    }
  },

  async getTemplateById(id: string): Promise<ChecklistTemplate | null> {
    const { data, error } = await supabase
      .from('checklist_templates')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Error fetching checklist template:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.title,
      description: data.description || '',
      category: data.task_type,
      items: (data.items as any) || [],
      createdBy: data.created_by || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isDefault: false
    };
  }
};