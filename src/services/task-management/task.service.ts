
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  property_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  property_id?: string;
  assigned_to?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
}

export class TaskService {
  static async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getTaskById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createTask(taskData: CreateTaskData): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...taskData,
        created_by: (await supabase.auth.getUser()).data.user?.id || '',
        tenant_id: 'default-tenant-id' // You'll need to get this from context
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTask(id: string, updates: UpdateTaskData): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getTasksByProperty(propertyId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', assigneeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
