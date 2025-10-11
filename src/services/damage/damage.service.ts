// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/services/logger';

export interface DamageReport {
  id: string;
  title: string;
  description: string;
  property_id: string;
  reported_by: string;
  assigned_to?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'compensation_required' | 'compensation_paid' | 'closed';
  damage_date: string;
  created_at: string;
  updated_at: string;
  estimated_cost?: number;
  final_cost?: number;
  compensation_amount?: number;
  compensation_notes?: string;
  conclusion?: string;
  resolution_date?: string;
}

export interface DamageReportMedia {
  id: string;
  report_id: string;
  media_type: 'photo' | 'video';
  url: string;
  created_at: string;
  uploaded_by: string;
}

export const damageService = {
  async getDamageReports(): Promise<DamageReport[]> {
    try {
      const { data, error } = await supabase
        .from('damage_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      logger.error("Error fetching damage reports", error, { component: 'damageService' });
      toast.error('Failed to load damage reports');
      return [];
    }
  },

  async createDamageReport(report: Omit<DamageReport, 'id' | 'created_at' | 'updated_at'>): Promise<DamageReport | null> {
    try {
      const { data, error } = await supabase
        .from('damage_reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      toast.success('Damage report created successfully');
      return data;
    } catch (error: any) {
      logger.error("Error creating damage report", error, { component: 'damageService' });
      toast.error('Failed to create damage report');
      return null;
    }
  },

  async uploadMedia(file: File, reportId: string, type: 'photo' | 'video'): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reportId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('damage-reports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('damage-reports')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('damage_report_media')
        .insert({
          report_id: reportId,
          media_type: type,
          url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;
      return publicUrl;
    } catch (error: any) {
      logger.error("Error uploading media", error, { component: 'damageService' });
      toast.error('Failed to upload media');
      return null;
    }
  }
};
