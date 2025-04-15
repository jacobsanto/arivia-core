
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FinancialReport {
  id: string;
  property: string;
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface OccupancyReport {
  id: string;
  property: string;
  month: string;
  occupancy_rate: number;
  revenue: number;
  bookings: number;
  average_stay?: number;
  created_at?: string;
  updated_at?: string;
}

export const analyticsService = {
  // Financial Reports
  async getFinancialReports(): Promise<FinancialReport[]> {
    try {
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching financial reports:', error);
      toast.error('Failed to load financial reports', {
        description: error.message
      });
      return [];
    }
  },

  async getFinancialReportsByProperty(property: string): Promise<FinancialReport[]> {
    try {
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .eq('property', property);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching financial reports for property ${property}:`, error);
      return [];
    }
  },

  async addFinancialReport(report: Omit<FinancialReport, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialReport | null> {
    try {
      const { data, error } = await supabase
        .from('financial_reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      toast.success('Financial report added successfully');
      return data;
    } catch (error: any) {
      console.error('Error adding financial report:', error);
      toast.error('Failed to add financial report', {
        description: error.message
      });
      return null;
    }
  },

  // Occupancy Reports
  async getOccupancyReports(): Promise<OccupancyReport[]> {
    try {
      const { data, error } = await supabase
        .from('occupancy_reports')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching occupancy reports:', error);
      toast.error('Failed to load occupancy reports', {
        description: error.message
      });
      return [];
    }
  },

  async getOccupancyReportsByProperty(property: string): Promise<OccupancyReport[]> {
    try {
      const { data, error } = await supabase
        .from('occupancy_reports')
        .select('*')
        .eq('property', property);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching occupancy reports for property ${property}:`, error);
      return [];
    }
  },

  async addOccupancyReport(report: Omit<OccupancyReport, 'id' | 'created_at' | 'updated_at'>): Promise<OccupancyReport | null> {
    try {
      const { data, error } = await supabase
        .from('occupancy_reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      toast.success('Occupancy report added successfully');
      return data;
    } catch (error: any) {
      console.error('Error adding occupancy report:', error);
      toast.error('Failed to add occupancy report', {
        description: error.message
      });
      return null;
    }
  },

  // Helper methods for formatting data
  formatFinancialReportData(data: FinancialReport[], property: string = "all"): FinancialReport[] {
    if (property === "all") {
      return data;
    }
    
    // Filter data for specific property
    return data.filter(item => item.property === property);
  },

  formatOccupancyReportData(data: OccupancyReport[], property: string = "all"): OccupancyReport[] {
    if (property === "all") {
      return data;
    }
    
    // Filter data for specific property
    return data.filter(item => item.property === property);
  }
};
