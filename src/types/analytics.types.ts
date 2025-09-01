export interface KPIMetrics {
  totalOperationalCosts: number;
  tasksCompleted: number;
  openIssues: number;
  avgCostPerTask: number;
}

export interface FinancialOverviewData {
  month: string;
  maintenanceCosts: number;
  damageCosts: number;
  totalCosts: number;
}

export interface PropertyInsight {
  propertyName: string;
  totalCosts: number;
  taskCount: number;
}

export interface TaskPriorityData {
  priority: string;
  count: number;
  color: string;
}

export interface TaskTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TeamPerformanceData {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  completedTasks: number;
  housekeepingTasks: number;
  maintenanceTasks: number;
  totalMaintenanceCosts: number;
}

export interface AnalyticsFilters {
  dateRange: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'this-year' | 'custom';
  propertyId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsData {
  kpis: KPIMetrics;
  financialOverview: FinancialOverviewData[];
  propertyInsights: PropertyInsight[];
  taskPriorities: TaskPriorityData[];
  taskTypeBreakdown: TaskTypeBreakdown[];
  teamPerformance: TeamPerformanceData[];
}

export const DATE_RANGE_OPTIONS = [
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'last-90-days', label: 'Last 90 Days' },
  { value: 'this-year', label: 'This Year' }
] as const;

export const PRIORITY_COLORS = {
  urgent: '#ef4444',
  high: '#f97316', 
  medium: '#eab308',
  low: '#22c55e'
} as const;

export const TASK_TYPE_COLORS = {
  housekeeping: '#3b82f6',
  maintenance: '#8b5cf6'
} as const;