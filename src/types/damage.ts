
export type DamageReportStatus = 
  | 'pending' 
  | 'investigating' 
  | 'in_progress' 
  | 'resolved' 
  | 'cancelled' 
  | 'disputed'
  | 'compensation_required'
  | 'compensation_paid'
  | 'closed';

export interface DamageReport {
  id: string;
  title: string;
  description: string;
  status: DamageReportStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  propertyId?: string;
  property_id: string; // For Supabase compatibility
  reportedBy?: string;
  reported_by: string; // For Supabase compatibility
  assignedTo?: string;
  assigned_to?: string; // For Supabase compatibility
  damageDate?: string;
  damage_date: string; // For Supabase compatibility
  estimatedCost?: number;
  estimated_cost?: number; // For Supabase compatibility
  finalCost?: number;
  final_cost?: number; // For Supabase compatibility
  photos?: string[];
  createdAt?: string;
  created_at: string; // For Supabase compatibility
  updatedAt?: string;
  updated_at: string; // For Supabase compatibility
  resolutionDate?: string;
  resolution_date?: string; // For Supabase compatibility
  conclusion?: string;
  compensationAmount?: number;
  compensation_amount?: number; // For Supabase compatibility
  compensationNotes?: string;
  compensation_notes?: string; // For Supabase compatibility
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
