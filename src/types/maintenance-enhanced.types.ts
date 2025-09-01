export interface MaintenanceTaskEnhanced {
  id: string;
  title: string;
  description?: string;
  property: {
    id: string;
    name: string;
    address?: string;
  };
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
  taskType: 'repair' | 'inspection' | 'routine_maintenance' | 'emergency' | 'preventive';
  status: 'pending' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dueDate?: string;
  scheduledDate?: string;
  completedAt?: string;
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  location?: string; // specific location within property
  room?: string;
  
  // Documentation
  photos: {
    id: string;
    url: string;
    caption?: string;
    uploadedAt: string;
    uploadedBy: string;
    type: 'before' | 'during' | 'after';
  }[];
  
  // Workflow & Process
  checklist: {
    id: number;
    title: string;
    completed: boolean;
    completedAt?: string;
    completedBy?: string;
    notes?: string;
  }[];
  
  // Integration
  damageReportId?: string;
  purchaseOrderId?: string;
  recurringTaskId?: string;
  
  // Communication
  comments: {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    message: string;
    createdAt: string;
    type: 'comment' | 'status_change' | 'assignment';
  }[];
  
  // Tools & Materials
  requiredTools: string[];
  requiredMaterials: {
    name: string;
    quantity?: number;
    estimatedCost?: number;
  }[];
  
  // Quality Control
  qcStatus?: 'pending' | 'passed' | 'failed' | 'not_required';
  qcNotes?: string;
  qcReviewedBy?: string;
  qcReviewedAt?: string;
  
  // Safety & Compliance
  safetyNotes?: string;
  permitRequired?: boolean;
  permitNumber?: string;
  
  // System fields
  createdAt: string;
  updatedAt: string;
  
  // Metadata
  tags: string[];
  isRecurring?: boolean;
  nextRecurrence?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  dependencies?: string[]; // task IDs this depends on
}

export interface MaintenanceFilters {
  search: string;
  property: string;
  assignee: string;
  status: string;
  priority: string;
  taskType: string;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  tags: string[];
  hasPhotos?: boolean;
  hasPurchaseOrder?: boolean;
  isOverdue?: boolean;
  needsQC?: boolean;
}

export type MaintenanceViewMode = 'grid' | 'list' | 'agenda' | 'calendar';

export type MaintenanceSortField = 
  | 'title' 
  | 'property' 
  | 'assignee' 
  | 'dueDate' 
  | 'priority' 
  | 'status' 
  | 'createdAt' 
  | 'estimatedCost';

export type SortDirection = 'asc' | 'desc';

export interface MaintenanceSort {
  field: MaintenanceSortField;
  direction: SortDirection;
}

// Quick actions for maintenance tasks
export interface MaintenanceQuickAction {
  id: string;
  label: string;
  icon: string;
  action: (task: MaintenanceTaskEnhanced) => void;
  variant?: 'default' | 'secondary' | 'destructive';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

// Statistics for the overview
export interface MaintenanceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  urgent: number;
  totalCost: number;
  avgCompletionTime: number;
  completionRate: number;
}

// For agenda view grouping
export interface MaintenanceAgendaGroup {
  key: string;
  title: string;
  count: number;
  tasks: MaintenanceTaskEnhanced[];
  isOverdue?: boolean;
  isToday?: boolean;
}

// Calendar event interface
export interface MaintenanceCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  task: MaintenanceTaskEnhanced;
  className?: string;
}

export interface CreateMaintenanceTaskData {
  title: string;
  description?: string;
  propertyId: string;
  assigneeId?: string;
  taskType: MaintenanceTaskEnhanced['taskType'];
  priority: MaintenanceTaskEnhanced['priority'];
  dueDate?: string;
  scheduledDate?: string;
  estimatedCost?: number;
  estimatedDuration?: number;
  location?: string;
  room?: string;
  requiredTools: string[];
  requiredMaterials: {
    name: string;
    quantity?: number;
    estimatedCost?: number;
  }[];
  safetyNotes?: string;
  permitRequired?: boolean;
  tags: string[];
  photos?: File[];
  checklistTemplateId?: string;
  damageReportId?: string;
  purchaseOrderId?: string;
}