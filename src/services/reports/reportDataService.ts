
import { toastService } from "@/services/toast/toast.service";
import { supabase } from "@/integrations/supabase/client";

// Define data structure interfaces for consistency
export interface PropertyReportData {
  property: string;
  taskCount: number;
  completionRate: number;
  averageTime: number;
  rating: number;
}

export interface StaffReportData {
  name: string;
  tasksCompleted: number;
  tasksAssigned: number;
  completionRate: number;
  averageTime: number;
}

export interface TimeAnalysisData {
  timeframe: string;
  averageCompletionTime: number;
  taskCount: number;
  onTimePercentage: number;
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
      // For now using mock data
      // In production, this would query Supabase with filters
      const mockData: PropertyReportData[] = [
        {
          property: "Villa Caldera",
          taskCount: 48,
          completionRate: 92,
          averageTime: 45,
          rating: 4.8
        },
        {
          property: "Villa Oceana",
          taskCount: 36,
          completionRate: 88,
          averageTime: 51,
          rating: 4.5
        },
        {
          property: "Villa Sunset",
          taskCount: 42,
          completionRate: 95,
          averageTime: 38,
          rating: 4.9
        }
      ];
      
      return mockData;
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
      // For now using mock data
      // In production, this would query Supabase with filters
      const mockData: StaffReportData[] = [
        {
          name: "Maria K.",
          tasksCompleted: 45,
          tasksAssigned: 48,
          completionRate: 93.8,
          averageTime: 42
        },
        {
          name: "Alex D.",
          tasksCompleted: 32,
          tasksAssigned: 36,
          completionRate: 88.9,
          averageTime: 53
        },
        {
          name: "Sophie T.",
          tasksCompleted: 39,
          tasksAssigned: 42,
          completionRate: 92.9,
          averageTime: 37
        }
      ];
      
      return mockData;
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
      // For now using mock data
      // In production, this would query Supabase with filters
      const mockData: TimeAnalysisData[] = [
        {
          timeframe: "Morning",
          averageCompletionTime: 42,
          taskCount: 65,
          onTimePercentage: 94
        },
        {
          timeframe: "Afternoon",
          averageCompletionTime: 48,
          taskCount: 72,
          onTimePercentage: 88
        },
        {
          timeframe: "Evening",
          averageCompletionTime: 53,
          taskCount: 45,
          onTimePercentage: 82
        }
      ];
      
      return mockData;
    } catch (error: any) {
      console.error('Error getting time analysis data:', error);
      toastService.error('Error loading time analysis data');
      return [];
    }
  }
}

// Export a singleton instance
export const reportDataService = new ReportDataService();
