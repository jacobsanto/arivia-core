
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskTemplate, TaskComment } from '@/types/task-management';
import { ChecklistItem } from '@/types/checklistTypes';
import { toast } from 'sonner';

interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_role?: string;
  assigned_to?: string;
  property_id?: string;
  booking_id?: string;
  due_date?: string;
  metadata?: Record<string, any>;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  assigned_role?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

interface TaskFilters {
  status?: ('open' | 'in_progress' | 'completed' | 'cancelled')[];
  priority?: ('low' | 'medium' | 'high' | 'urgent')[];
  assigned_role?: string[];
  property_id?: string;
  assigned_to?: string;
  due_date_from?: string;
  due_date_to?: string;
}

// Helper function to safely parse JSON data
const safeJsonParse = (data: any, fallback: any = {}) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }
  return data || fallback;
};

// Helper function to map Supabase task to internal Task type
const mapSupabaseTask = (supabaseTask: any): Task => {
  const metadata = safeJsonParse(supabaseTask.metadata, {});
  
  return {
    id: supabaseTask.id,
    title: supabaseTask.title,
    description: supabaseTask.description || '',
    status: supabaseTask.status,
    priority: supabaseTask.priority,
    assigned_to: supabaseTask.assigned_to, // Use snake_case for Supabase compatibility
    assigned_role: supabaseTask.assigned_role, // Use snake_case for Supabase compatibility
    propertyId: supabaseTask.property_id,
    bookingId: supabaseTask.booking_id,
    dueDate: supabaseTask.due_date ? new Date(supabaseTask.due_date).toISOString() : undefined,
    createdAt: new Date(supabaseTask.created_at).toISOString(),
    updatedAt: new Date(supabaseTask.updated_at).toISOString(),
    completedAt: supabaseTask.completed_at ? new Date(supabaseTask.completed_at).toISOString() : undefined,
    createdBy: supabaseTask.created_by,
    metadata: metadata,
    type: "Other", // Default type since it's not in Supabase schema
    checklist: metadata.checklist || [],
    notes: metadata.notes || '',
    attachments: metadata.attachments || [],
    tags: metadata.tags || [],
    approvalStatus: metadata.approvalStatus,
    photos: metadata.photos || [],
    cleaningDetails: metadata.cleaningDetails,
    rejectionReason: metadata.rejectionReason
  };
};

// Helper function to map Supabase task template to internal TaskTemplate type
const mapSupabaseTaskTemplate = (supabaseTemplate: any): TaskTemplate => {
  return {
    id: supabaseTemplate.id,
    name: supabaseTemplate.name,
    description: supabaseTemplate.description || '',
    assigned_role: supabaseTemplate.assigned_role, // Use snake_case for Supabase compatibility
    priority: supabaseTemplate.priority,
    estimatedDuration: supabaseTemplate.estimated_duration,
    checklist: safeJsonParse(supabaseTemplate.checklist, []) as ChecklistItem[],
    isActive: supabaseTemplate.is_active,
    createdBy: supabaseTemplate.created_by,
    createdAt: new Date(supabaseTemplate.created_at).toISOString(),
    updatedAt: new Date(supabaseTemplate.updated_at).toISOString()
  };
};

export class TaskService {
  
  // Get all tasks for current tenant with optional filters
  static async getTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status as readonly string[]);
      }

      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority as readonly string[]);
      }

      if (filters?.assigned_role?.length) {
        query = query.in('assigned_role', filters.assigned_role);
      }

      if (filters?.property_id) {
        query = query.eq('property_id', filters.property_id);
      }

      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters?.due_date_from) {
        query = query.gte('due_date', filters.due_date_from);
      }

      if (filters?.due_date_to) {
        query = query.lte('due_date', filters.due_date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(mapSupabaseTask);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks', {
        description: error.message
      });
      return [];
    }
  }

  // Get tasks assigned to current user
  static async getMyTasks(): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapSupabaseTask);
    } catch (error: any) {
      console.error('Error fetching my tasks:', error);
      toast.error('Failed to load your tasks', {
        description: error.message
      });
      return [];
    }
  }

  // Create a new task
  static async createTask(tenantId: string, taskData: CreateTaskData): Promise<Task | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          tenant_id: tenantId,
          created_by: user.id,
          ...taskData
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Task created successfully');
      return mapSupabaseTask(data);
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task', {
        description: error.message
      });
      return null;
    }
  }

  // Update a task
  static async updateTask(taskId: string, updates: UpdateTaskData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success('Task updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task', {
        description: error.message
      });
      return false;
    }
  }

  // Complete a task
  static async completeTask(taskId: string): Promise<boolean> {
    return this.updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  }

  // Delete a task
  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success('Task deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task', {
        description: error.message
      });
      return false;
    }
  }

  // Get task templates
  static async getTaskTemplates(): Promise<TaskTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []).map(mapSupabaseTaskTemplate);
    } catch (error: any) {
      console.error('Error fetching task templates:', error);
      toast.error('Failed to load task templates', {
        description: error.message
      });
      return [];
    }
  }

  // Create task from template
  static async createTaskFromTemplate(
    tenantId: string, 
    templateId: string, 
    overrides: Partial<CreateTaskData> = {}
  ): Promise<Task | null> {
    try {
      const { data: template, error: templateError } = await supabase
        .from('task_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      const taskData: CreateTaskData = {
        title: template.name,
        description: template.description,
        priority: template.priority,
        assigned_role: template.assigned_role,
        metadata: {
          template_id: templateId,
          checklist: safeJsonParse(template.checklist, []),
          estimated_duration: template.estimated_duration
        },
        ...overrides
      };

      return await this.createTask(tenantId, taskData);
    } catch (error: any) {
      console.error('Error creating task from template:', error);
      toast.error('Failed to create task from template', {
        description: error.message
      });
      return null;
    }
  }

  // Get task comments
  static async getTaskComments(taskId: string): Promise<TaskComment[]> {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(comment => ({
        id: comment.id,
        tenant_id: comment.tenant_id,
        task_id: comment.task_id,
        user_id: comment.user_id,
        comment: comment.comment,
        created_at: new Date(comment.created_at).toISOString()
      }));
    } catch (error: any) {
      console.error('Error fetching task comments:', error);
      return [];
    }
  }

  // Add task comment
  static async addTaskComment(tenantId: string, taskId: string, comment: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('task_comments')
        .insert({
          tenant_id: tenantId,
          task_id: taskId,
          user_id: user.id,
          comment
        });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error adding task comment:', error);
      toast.error('Failed to add comment', {
        description: error.message
      });
      return false;
    }
  }
}
