export interface DamageReport {
  id: string;
  title: string;
  description: string;
  property: {
    id: string;
    name: string;
  };
  location: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  source: 'guest' | 'staff' | 'wear_tear' | 'accident' | 'unknown';
  status: 'reported' | 'in_review' | 'resolved' | 'rejected';
  estimatedCost: number;
  actualCost?: number;
  photos: DamagePhoto[];
  reportedBy: {
    id: string;
    name: string;
    role: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
    role: string;
  };
  resolutionNotes?: string;
  maintenanceTaskId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface DamagePhoto {
  id: string;
  reportId: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface DamageReportFilters {
  search: string;
  property: string;
  status: string;
  priority: string;
  source: string;
  reportedBy: string;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  costRange: {
    min: number | null;
    max: number | null;
  };
}

export interface DamageSourceSummary {
  source: string;
  count: number;
  totalCost: number;
  averageCost: number;
  color: string;
}

export interface DamageStats {
  total: number;
  reported: number;
  inReview: number;
  resolved: number;
  totalCost: number;
  averageCost: number;
  averageResolutionTime: number;
  mostCommonSource: string;
}

export interface DamageAgendaGroup {
  key: string;
  title: string;
  count: number;
  reports: DamageReport[];
  isOverdue?: boolean;
  isToday?: boolean;
}

export interface CreateDamageReportData {
  title: string;
  description: string;
  propertyId: string;
  location: string;
  priority: DamageReport['priority'];
  source: DamageReport['source'];
  estimatedCost: number;
  photos: File[];
}

export interface UpdateDamageReportData {
  status?: DamageReport['status'];
  priority?: DamageReport['priority'];
  actualCost?: number;
  resolutionNotes?: string;
}

export type DamageViewMode = 'grid' | 'list' | 'agenda' | 'calendar';

export type DamageSortField = 
  | 'title' 
  | 'property' 
  | 'priority' 
  | 'source' 
  | 'status'
  | 'estimatedCost'
  | 'actualCost'
  | 'createdAt'
  | 'resolvedAt';

export type SortDirection = 'asc' | 'desc';

export interface DamageSort {
  field: DamageSortField;
  direction: SortDirection;
}