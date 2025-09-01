export type RecurrenceFrequency = 'weekly' | 'monthly';

export type TaskModule = 'housekeeping' | 'maintenance';

export type HousekeepingTaskType = 
  | 'turnover-clean'
  | 'mid-stay-tidy'
  | 'deep-clean'
  | 'guest-checkout-clean';

export type MaintenanceTaskType = 
  | 'hvac-maintenance'
  | 'pool-maintenance'
  | 'electrical-inspection'
  | 'plumbing-check'
  | 'general-maintenance';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AppliesTo = 
  | 'all-properties'
  | 'properties-with-pools'
  | 'specific-property';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // every X weeks/months
  dayOfWeek?: string; // for weekly (Monday, Tuesday, etc.)
  dayOfMonth?: number; // for monthly (1-31)
}

export interface RecurringTaskTemplate {
  id: string;
  title: string;
  description: string;
  taskModule: TaskModule;
  baseTaskType: HousekeepingTaskType | MaintenanceTaskType;
  appliesTo: AppliesTo;
  specificPropertyId?: string;
  assignedTo?: string;
  priority: TaskPriority;
  checklistTemplateId?: string;
  recurrenceRule: RecurrenceRule;
  nextDueDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringTasksState {
  templates: RecurringTaskTemplate[];
  loading: boolean;
  error: string | null;
}

export const TASK_MODULE_LABELS: Record<TaskModule, string> = {
  housekeeping: 'Housekeeping',
  maintenance: 'Maintenance'
};

export const HOUSEKEEPING_TASK_LABELS: Record<HousekeepingTaskType, string> = {
  'turnover-clean': 'Turnover Clean',
  'mid-stay-tidy': 'Mid-stay Tidy',
  'deep-clean': 'Deep Clean',
  'guest-checkout-clean': 'Guest Checkout Clean'
};

export const MAINTENANCE_TASK_LABELS: Record<MaintenanceTaskType, string> = {
  'hvac-maintenance': 'HVAC Maintenance',
  'pool-maintenance': 'Pool Maintenance',
  'electrical-inspection': 'Electrical Inspection',
  'plumbing-check': 'Plumbing Check',
  'general-maintenance': 'General Maintenance'
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

export const APPLIES_TO_LABELS: Record<AppliesTo, string> = {
  'all-properties': 'All Properties',
  'properties-with-pools': 'Properties with Pools',
  'specific-property': 'Specific Property'
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday', 
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];