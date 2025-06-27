
export interface Task {
  id: string;
  tenantId: string;
  propertyId: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType = 
  | "housekeeping"
  | "maintenance"
  | "inspection";

export type TaskStatus = 
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TaskPriority = 
  | "low"
  | "normal"
  | "high"
  | "urgent";
