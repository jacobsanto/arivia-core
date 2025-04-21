
export interface Task {
  id: string;
  task_type: string;
  due_date: string;
  listing_id: string;
  status: 'pending' | 'in-progress' | 'done';
  assigned_to: string;
  created_at: string;
  booking_id?: string;
  checklist?: any[];
}

export interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onAssignTask: (taskId: string, staffMember: string) => Promise<void>;
  cleaningDefinitions: Record<string, string>;
}

export interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: 'pending' | 'in-progress' | 'done';
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onAssignTask: (taskId: string, staffMember: string) => Promise<void>;
  cleaningDefinitions: Record<string, string>;
}
