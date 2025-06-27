
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
  dueDate?: string; // Always string for consistency
  createdAt: string; // Changed to string
  updatedAt: string; // Changed to string
  completedAt?: string;
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
  createdAt: string; // Changed to string
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

// Form types
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

// Import zod for schema validation
import { z } from "zod";

// Zod schema for cleaning task form
export const cleaningTaskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  property: z.string().min(1, "Property is required"),
  roomType: z.string().min(1, "Room type is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  description: z.string().optional(),
  checklist: z.array(z.string()).optional()
});
