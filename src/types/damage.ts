
export interface DamageReport {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'investigating' | 'in_progress' | 'resolved' | 'cancelled' | 'disputed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  propertyId: string;
  reportedBy: string;
  assignedTo?: string;
  damageDate: Date;
  estimatedCost?: number;
  finalCost?: number;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolutionDate?: Date;
  conclusion?: string;
  compensationAmount?: number;
  compensationNotes?: string;
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
