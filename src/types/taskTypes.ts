
export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Cancelled" | "Approved" | "Rejected";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type TaskType = "Cleaning" | "Maintenance" | "Inspection" | "Check-in" | "Check-out" | "Other";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  required?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignedTo?: string;
  assignedRole?: string;
  propertyId?: string;
  roomNumber?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  checklist?: ChecklistItem[];
  notes?: string;
  attachments?: string[];
  createdBy: string;
  tags?: string[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  type?: TaskType[];
  assignedTo?: string;
  propertyId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
