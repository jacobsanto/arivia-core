
export interface MaintenanceInstruction {
  id: number;
  title: string;
  completed: boolean;
}

export interface MaintenanceReport {
  timeSpent: string;
  materialsUsed: string;
  cost: string;
  notes: string;
}

export interface MaintenanceTask {
  id: number;
  title: string;
  property: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
  description: string;
  location: string;
  requiredTools: string[];
  instructions: MaintenanceInstruction[];
  beforePhotos: string[];
  afterPhotos: string[];
  beforeVideos: string[];
  afterVideos: string[];
  createdAt: string;
  report?: MaintenanceReport;
  // Adding new fields to match Task type for compatibility
  type: string; // For consistency when merging with housekeeping tasks
  // Additional fields for enhanced task management
  isRecurring?: boolean;
  category?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
}
