
import { supabase } from "@/integrations/supabase/client";

// Define the interface that matches the database schema
interface DatabaseDamageReport {
  id: string;
  property_id: string;
  title: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'compensation_required' | 'compensation_paid' | 'closed';
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

// Export interface for use in components (with priority field)
export interface DamageReport extends DatabaseDamageReport {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export type DamageReportStatus = 'pending' | 'investigating' | 'resolved' | 'compensation_required' | 'compensation_paid' | 'closed';

export class DamageService {
  static async getDamageReports(): Promise<DamageReport[]> {
    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching damage reports:', error);
      throw new Error('Failed to fetch damage reports');
    }

    // Add default priority to match interface
    return (data || []).map(report => ({
      ...report,
      priority: 'medium' as const
    }));
  }

  static async getDamageReportById(id: string): Promise<DamageReport | null> {
    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching damage report:', error);
      return null;
    }

    return data ? { ...data, priority: 'medium' as const } : null;
  }

  static async createDamageReport(
    report: Omit<DatabaseDamageReport, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DamageReport> {
    const { data, error } = await supabase
      .from('damage_reports')
      .insert([report])
      .select()
      .single();

    if (error) {
      console.error('Error creating damage report:', error);
      throw new Error('Failed to create damage report');
    }

    return { ...data, priority: 'medium' as const };
  }

  static async updateDamageReport(
    id: string,
    updates: Partial<DatabaseDamageReport>
  ): Promise<DamageReport> {
    const { data, error } = await supabase
      .from('damage_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating damage report:', error);
      throw new Error('Failed to update damage report');
    }

    return { ...data, priority: 'medium' as const };
  }

  static async deleteDamageReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('damage_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting damage report:', error);
      throw new Error('Failed to delete damage report');
    }
  }

  static async getDamageReportsByStatus(status: DamageReportStatus): Promise<DamageReport[]> {
    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching damage reports by status:', error);
      throw new Error('Failed to fetch damage reports');
    }

    return (data || []).map(report => ({
      ...report,
      priority: 'medium' as const
    }));
  }

  static async getDamageReportsByProperty(propertyId: string): Promise<DamageReport[]> {
    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching damage reports by property:', error);
      throw new Error('Failed to fetch damage reports');
    }

    return (data || []).map(report => ({
      ...report,
      priority: 'medium' as const
    }));
  }
}
