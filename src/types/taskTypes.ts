
export interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
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
}
