
export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Cancelled" | "Approved" | "Rejected";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type TaskType = "Cleaning" | "Maintenance" | "Inspection" | "Check-in" | "Check-out" | "Other";

export type ApprovalStatus = 'Approved' | 'Rejected' | 'Pending';

export interface ChecklistItem {
  id: string;
  title: string;
  text: string;
  description?: string;
  completed: boolean;
  required?: boolean;
}

export interface CleaningDetails {
  roomsCleaned: number;
  cleaningType: string;
  notes?: string;
  scheduledCleanings?: Date[];
  stayDuration?: number;
  guestCheckIn?: string;
  guestCheckOut?: string;
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
  property?: string; // Keep for backward compatibility
  roomNumber?: string;
  dueDate?: Date | string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  checklist: ChecklistItem[];
  notes?: string;
  attachments?: string[];
  createdBy: string;
  tags?: string[];
  approvalStatus?: ApprovalStatus;
  photos: string[];
  cleaningDetails?: CleaningDetails;
  rejectionReason?: string;
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

// Add missing form types
export interface CleaningTaskFormValues {
  title: string;
  property: string;
  roomType: string;
  dueDate?: Date;
  assignedTo: string;
  priority: TaskPriority;
  description: string;
  checklist: string[];
}

export interface CleaningDetails {
  roomsCleaned: number;
  cleaningType: string;
  notes?: string;
  scheduledCleanings?: Date[];
  stayDuration?: number;
  guestCheckIn?: string;
  guestCheckOut?: string;
}

// Simple schema for now - can be enhanced with zod later
export const cleaningTaskFormSchema = {
  title: { required: true, minLength: 3 },
  property: { required: true },
  roomType: { required: true },
  assignedTo: { required: true },
  priority: { required: true },
  description: { required: false }
};
