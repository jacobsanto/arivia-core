export interface CombinedTask {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string; // Changed from 'date' to 'due_date' to match database
  type: 'housekeeping' | 'maintenance' | 'general';
  property_id?: string;
  assigned_to?: string;
  location?: string;
  created_at: string;
}
