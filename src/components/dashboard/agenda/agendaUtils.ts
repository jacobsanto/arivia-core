
export interface CombinedTask {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  type: 'housekeeping' | 'maintenance' | 'general';
  property_id?: string;
  assigned_to?: string;
  location?: string;
  created_at: string;
}
