
import { toastService } from "@/services/toast/toast.service";
import { supabase } from "@/integrations/supabase/client";

// Define data structure interfaces for consistency
export interface PropertyReportData {
  property: string;
  name?: string; // Alias for property
  taskCount: number;
  completionRate: number;
  averageTime: number;
  rating: number;
  completed: number;
  rejected: number;
  approved: number;
}

export interface StaffReportData {
  name: string;
  tasksCompleted: number;
  tasksAssigned: number;
  completionRate: number;
  averageTime: number;
  rating: number;
  completed: number; // Alias for tasksCompleted
  avgTime: number; // Alias for averageTime
}

export interface TimeAnalysisData {
  timeframe: string;
  name?: string; // Alias for timeframe
  averageCompletionTime: number;
  taskCount: number;
  onTimePercentage: number;
  avgTime: number; // Alias for averageCompletionTime
  tasks: number; // Alias for taskCount
}

export interface ReportFilters {
  dateRange?: { from?: Date; to?: Date };
  propertyId?: string;
  staffId?: string;
  taskType?: string;
}

/**
 * Report Data Service
 * 
 * Provides standardized access to data for reports
 */
class ReportDataService {
  /**
   * Get property-based report data
   */
  async getPropertyData(filters: ReportFilters = {}): Promise<PropertyReportData[]> {
    try {
      // Return empty array for now - no mock data
      return [];
    } catch (error: any) {
      console.error('Error getting property report data:', error);
      toastService.error('Error loading property data');
      return [];
    }
  }
  
  /**
   * Get staff-based report data
   */
  async getStaffData(filters: ReportFilters = {}): Promise<StaffReportData[]> {
    try {
      // Return empty array for now - no mock data
      return [];
    } catch (error: any) {
      console.error('Error getting staff report data:', error);
      toastService.error('Error loading staff data');
      return [];
    }
  }
  
  /**
   * Get time analysis data
   */
  async getTimeAnalysisData(filters: ReportFilters = {}): Promise<TimeAnalysisData[]> {
    try {
      // Return empty array for now - no mock data
      return [];
    } catch (error: any) {
      console.error('Error getting time analysis data:', error);
      toastService.error('Error loading time analysis data');
      return [];
    }
  }
}

// Export a singleton instance
export const reportDataService = new ReportDataService();
