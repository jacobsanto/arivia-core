
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
  specialInstructions?: string;
  createdAt: string;
  report?: MaintenanceReport;
}

export interface DateRangeFilter {
  startDate: Date | null;
  endDate: Date | null;
}
