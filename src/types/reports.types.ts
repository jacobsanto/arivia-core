export type ReportType = 
  | 'task-completion-log'
  | 'maintenance-cost-breakdown'
  | 'damage-history'
  | 'inventory-levels'
  | 'financial-summary'
  | 'property-performance'
  | 'staff-productivity'
  | 'guest-satisfaction'
  | 'booking-analytics'
  | 'revenue-analysis'
  | 'expense-tracking'
  | 'operational-efficiency'
  | 'compliance-audit'
  | 'vendor-performance'
  | 'energy-consumption'
  | 'turnover-metrics';

export interface ReportColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'currency';
}

export interface GeneratedReport {
  title: string;
  data: Record<string, any>[];
  columns: ReportColumn[];
  type: ReportType;
  generatedAt: Date;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}

export interface ReportFilters {
  property?: string;
  assignee?: string;
  status?: string;
  source?: string;
  category?: string;
}

export interface ReportGeneratorState {
  reportType: ReportType | '';
  startDate: string;
  endDate: string;
  filters: ReportFilters;
  isGenerating: boolean;
  generatedReport: GeneratedReport | null;
}