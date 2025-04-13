
export interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
}

export interface CleaningDetails {
  cleaningType: "Standard" | "Full" | "Linen & Towel Change";
  stayDuration?: number; // Number of nights
  scheduledCleanings?: string[]; // Array of scheduled cleaning dates
  guestCheckIn?: string; // Check-in date
  guestCheckOut?: string; // Check-out date
}

export interface Task {
  id: number;
  title: string;
  property: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
  description: string;
  approvalStatus: "Approved" | "Rejected" | "Pending" | null;
  rejectionReason: string | null;
  photos?: string[];
  checklist: ChecklistItem[];
  // Adding new fields to support more rich task management
  isRecurring?: boolean;
  category?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  location?: string; // specific location within property
  cleaningDetails?: CleaningDetails; // For housekeeping specific information
}
