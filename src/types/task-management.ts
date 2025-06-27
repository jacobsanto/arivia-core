
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_role?: string;
  assigned_to?: string;
  property_id?: string;
  booking_id?: string;
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface TaskTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  assigned_role: string;
  priority: TaskPriority;
  estimated_duration?: number;
  checklist: ChecklistItem[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  required?: boolean;
}

export interface TaskComment {
  id: string;
  tenant_id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigned_role?: string[];
  property_id?: string;
  due_date_from?: string;
  due_date_to?: string;
  assigned_to?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigned_role?: string;
  assigned_to?: string;
  property_id?: string;
  booking_id?: string;
  due_date?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}
