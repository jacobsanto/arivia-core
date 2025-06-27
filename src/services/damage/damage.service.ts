
import { supabase } from "@/integrations/supabase/client";
import { DamageReport, DamageReportStatus } from "@/types/damage";

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

    return data || [];
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

    return data;
  }

  static async createDamageReport(
    report: Omit<DamageReport, 'id' | 'created_at' | 'updated_at'>
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

    return data;
  }

  static async updateDamageReport(
    id: string,
    updates: Partial<DamageReport>
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

    return data;
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

    return data || [];
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

    return data || [];
  }
}
