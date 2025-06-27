
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority } from "@/types/task-management";

export class TaskService {
  static async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }

    return data || [];
  }

  static async getTaskById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      return null;
    }

    return data;
  }

  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }

    return data;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }

    return data;
  }

  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  static async getTasksByStatus(status: TaskStatus[]): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('status', status as string[])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks by status:', error);
      throw new Error('Failed to fetch tasks');
    }

    return data || [];
  }

  static async getTasksByPriority(priority: TaskPriority[]): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('priority', priority as string[])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks by priority:', error);
      throw new Error('Failed to fetch tasks');
    }

    return data || [];
  }

  static async getTasksByProperty(propertyId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks by property:', error);
      throw new Error('Failed to fetch tasks');
    }

    return data || [];
  }

  static async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', assigneeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks by assignee:', error);
      throw new Error('Failed to fetch tasks');
    }

    return data || [];
  }
}
