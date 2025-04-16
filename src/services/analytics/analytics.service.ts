import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

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

export interface MaintenanceData {
  critical: number;
  standard: number;
  total: number;
  by_property?: Record<string, number>;
}

export interface PropertyStats {
  total: number;
  occupied: number;
  vacant: number;
  maintenance?: number;
  available?: number;
}

export const analyticsService = {
  // Financial Reports
  async getFinancialReports(dateRange?: { from?: Date; to?: Date }): Promise<FinancialReport[]> {
    try {
      let query = supabase
        .from('financial_reports')
        .select('*');
      
      // Apply date filter if provided
      if (dateRange?.from) {
        const fromMonth = format(dateRange.from, 'yyyy-MM');
        query = query.gte('month', fromMonth);
      }
      
      if (dateRange?.to) {
        const toMonth = format(dateRange.to, 'yyyy-MM');
        query = query.lte('month', toMonth);
      }

      const { data, error } = await query;

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

  async getFinancialReportsByProperty(property: string, dateRange?: { from?: Date; to?: Date }): Promise<FinancialReport[]> {
    try {
      let query = supabase
        .from('financial_reports')
        .select('*')
        .eq('property', property);
      
      // Apply date filter if provided
      if (dateRange?.from) {
        const fromMonth = format(dateRange.from, 'yyyy-MM');
        query = query.gte('month', fromMonth);
      }
      
      if (dateRange?.to) {
        const toMonth = format(dateRange.to, 'yyyy-MM');
        query = query.lte('month', toMonth);
      }

      const { data, error } = await query;

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
  async getOccupancyReports(dateRange?: { from?: Date; to?: Date }): Promise<OccupancyReport[]> {
    try {
      let query = supabase
        .from('occupancy_reports')
        .select('*');
        
      // Apply date filter if provided
      if (dateRange?.from) {
        const fromMonth = format(dateRange.from, 'yyyy-MM');
        query = query.gte('month', fromMonth);
      }
      
      if (dateRange?.to) {
        const toMonth = format(dateRange.to, 'yyyy-MM');
        query = query.lte('month', toMonth);
      }

      const { data, error } = await query;

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

  async getOccupancyReportsByProperty(property: string, dateRange?: { from?: Date; to?: Date }): Promise<OccupancyReport[]> {
    try {
      let query = supabase
        .from('occupancy_reports')
        .select('*')
        .eq('property', property);
      
      // Apply date filter if provided
      if (dateRange?.from) {
        const fromMonth = format(dateRange.from, 'yyyy-MM');
        query = query.gte('month', fromMonth);
      }
      
      if (dateRange?.to) {
        const toMonth = format(dateRange.to, 'yyyy-MM');
        query = query.lte('month', toMonth);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching occupancy reports for property ${property}:`, error);
      return [];
    }
  },

  // Properties Data
  async getPropertiesStats(): Promise<PropertyStats> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('status');

      if (error) throw error;
      
      const total = data.length;
      const occupied = data.filter(p => p.status === 'occupied').length;
      const vacant = data.filter(p => p.status === 'vacant').length;
      const maintenance = data.filter(p => p.status === 'maintenance').length;
      const available = vacant - maintenance;
      
      return {
        total,
        occupied,
        vacant,
        maintenance,
        available
      };
    } catch (error: any) {
      console.error('Error fetching property statistics:', error);
      return {
        total: 0,
        occupied: 0,
        vacant: 0
      };
    }
  },
  
  async getPropertiesList(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('name')
        .order('name');
        
      if (error) throw error;
      return data.map(p => p.name);
    } catch (error: any) {
      console.error('Error fetching property list:', error);
      return [];
    }
  },

  // Maintenance Data
  async getMaintenanceData(dateRange?: { from?: Date; to?: Date }): Promise<MaintenanceData> {
    try {
      let query = supabase
        .from('maintenance_tasks')
        .select('id, priority, property_id');
      
      // Apply date filter if provided
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const total = data.length;
      const critical = data.filter(item => item.priority === 'high' || item.priority === 'urgent').length;
      const standard = total - critical;
      
      // Aggregate by property
      const byProperty: Record<string, number> = {};
      for (const item of data) {
        byProperty[item.property_id] = (byProperty[item.property_id] || 0) + 1;
      }
      
      return { 
        total,
        critical,
        standard,
        by_property: byProperty
      };
    } catch (error: any) {
      console.error('Error fetching maintenance data:', error);
      return { total: 0, critical: 0, standard: 0 };
    }
  },

  // Tasks Data
  async getTasksData(dateRange?: { from?: Date; to?: Date }) {
    try {
      // Get housekeeping tasks
      let hkQuery = supabase
        .from('housekeeping_tasks')
        .select('id, status');
        
      // Apply date filter if provided
      if (dateRange?.from) {
        hkQuery = hkQuery.gte('created_at', dateRange.from.toISOString());
      }
      
      if (dateRange?.to) {
        hkQuery = hkQuery.lte('created_at', dateRange.to.toISOString());
      }
      
      const { data: hkData, error: hkError } = await hkQuery;
      
      if (hkError) throw hkError;
      
      const total = hkData.length;
      const completed = hkData.filter(t => t.status === 'completed').length;
      const pending = hkData.filter(t => t.status === 'pending').length;
      const inProgress = hkData.filter(t => t.status === 'in_progress').length;
      
      return {
        total,
        completed,
        pending,
        inProgress
      };
    } catch (error: any) {
      console.error('Error fetching tasks data:', error);
      return { total: 0, completed: 0, pending: 0, inProgress: 0 };
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
  },

  // Dashboard Overview
  async getDashboardOverview(dateRange?: { from?: Date; to?: Date }): Promise<{
    properties: PropertyStats;
    tasks: { total: number; completed: number; pending: number; inProgress?: number };
    maintenance: { total: number; critical: number; standard: number };
    revenue: number;
    bookings: number;
    occupancyRate: number;
  }> {
    try {
      // Get data in parallel for better performance
      const [
        propertiesStats,
        tasksData,
        maintenanceData,
        financialData,
        occupancyData
      ] = await Promise.all([
        this.getPropertiesStats(),
        this.getTasksData(dateRange),
        this.getMaintenanceData(dateRange),
        this.getFinancialReports(dateRange),
        this.getOccupancyReports(dateRange)
      ]);
      
      // Calculate totals
      const revenue = financialData.reduce((sum, item) => sum + item.revenue, 0);
      const bookings = occupancyData.reduce((sum, item) => sum + item.bookings, 0);
      
      // Calculate average occupancy rate
      const occupancyRate = occupancyData.length > 0 
        ? Math.round(occupancyData.reduce((sum, item) => sum + item.occupancy_rate, 0) / occupancyData.length) 
        : 0;
      
      return {
        properties: propertiesStats,
        tasks: tasksData,
        maintenance: maintenanceData,
        revenue,
        bookings,
        occupancyRate
      };
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }
};
