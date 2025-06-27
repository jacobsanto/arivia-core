export type DamageReportStatus = 
  | "pending" 
  | "investigating" 
  | "resolved" 
  | "compensation_required" 
  | "compensation_paid" 
  | "closed" 
  | "disputed";

export interface DamageReport {
  id: string;
  property_id: string;
  title: string;
  description: string;
  status: DamageReportStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  damage_date: string;
  reported_by: string;
  assigned_to?: string;
  estimated_cost?: number;
  final_cost?: number;
  compensation_amount?: number;
  compensation_notes?: string;
  conclusion?: string;
  resolution_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DamageReportFormValues {
  title: string;
  description: string;
  damage_date: string; // Change to string for form compatibility
  estimated_cost?: number;
  property_id: string;
  assigned_to?: string;
}

export interface DamageReportFilters {
  status?: string[];
  priority?: string[];
  propertyId?: string;
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
