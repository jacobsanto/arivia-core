
import { z } from "zod";

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | null;

export interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
}

export interface CleaningDetails {
  roomType: string;
  bedCount: number;
  bathCount: number;
  estimatedTime: number;
  cleaningType?: string;
  stayDuration?: number;
  guestCheckIn?: string;
  guestCheckOut?: string;
  scheduledCleanings?: string[];
}

export interface Task {
  id: string;
  title: string;
  property: string;
  assignedTo: string;
  dueDate: string;
  status: TaskStatus;
  priority: 'Low' | 'Medium' | 'High';
  description: string;
  checklist: ChecklistItem[];
  photos?: string[];
  location?: string;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string | null;
  cleaningDetails?: CleaningDetails;
  type?: string;
  cleaningServiceType?: 'Standard Cleaning' | 'Full Cleaning' | 'Linen & Towel Change';
}

export interface CleaningTaskFormValues {
  title: string;
  property: string;
  roomType: string;
  dueDate: Date | undefined;
  assignedTo: string;
  priority: string;
  description: string;
  checklistTemplate?: string;
  cleaningServiceType: 'Standard Cleaning' | 'Full Cleaning' | 'Linen & Towel Change';
}

export const cleaningTaskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  property: z.string().min(1, { message: "Property is required" }),
  roomType: z.string().min(1, { message: "Room type is required" }),
  dueDate: z.date().optional(),
  assignedTo: z.string().min(1, { message: "Assignee is required" }),
  priority: z.string().min(1, { message: "Priority is required" }),
  description: z.string().optional(),
  checklistTemplate: z.string().optional(),
  cleaningServiceType: z.enum(['Standard Cleaning', 'Full Cleaning', 'Linen & Towel Change']).default('Standard Cleaning')
});
