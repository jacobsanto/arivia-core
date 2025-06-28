
// Task utility functions
export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  assigned_to?: string;
  property?: string;
}

export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'in_progress':
      return 'blue';
    case 'pending':
      return 'yellow';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

export const getTaskPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'green';
    default:
      return 'gray';
  }
};

export const isTaskOverdue = (dueDate: string): boolean => {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
};
