
import { BaseService } from "../base/base.service";
import { toastService } from "../toast/toast.service";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface Report {
  id: string;
  name: string;
  type: 'task' | 'maintenance' | 'inventory' | 'custom';
  filters?: Record<string, any>;
  date_range?: {
    start_date: string | null;
    end_date: string | null;
  };
  created_at: string;
  created_by: string;
  last_run?: string;
  frequency?: string;
  recipients?: string[];
  next_scheduled?: string;
  status?: 'active' | 'paused' | 'archived';
}

/**
 * Report Service
 * 
 * Handles saving, loading, and managing reports
 */
export class ReportService extends BaseService<Report> {
  constructor() {
    super('reports');
  }

  /**
   * Create a new report
   */
  async createReport(report: Partial<Report>): Promise<Report> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("User not authenticated");
      }
      
      // Ensure name and type are provided
      if (!report.name) {
        throw new Error("Report name is required");
      }
      
      if (!report.type) {
        throw new Error("Report type is required");
      }
      
      // Create a properly structured report object that matches the database requirements
      const reportData = {
        name: report.name, // name is required
        type: report.type, // type is required
        created_by: user.user.id, // created_by is required
        status: 'active',
        filters: report.filters || {},
        date_range: report.date_range || null,
        frequency: report.frequency || null,
        recipients: report.recipients || null,
        next_scheduled: report.next_scheduled || null
      };
      
      const { data, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();
      
      if (error) throw error;
      
      toastService.success('Report Saved', {
        description: `Your report "${report.name}" has been saved.`
      });
      
      return data as Report;
    } catch (error: any) {
      console.error('Error saving report:', error);
      toastService.error('Error Saving Report', {
        description: error.message || 'There was an error saving your report. Please try again.'
      });
      throw error;
    }
  }

  /**
   * Generate a one-time report without saving
   */
  async generateReport(reportConfig: Partial<Report>): Promise<any> {
    try {
      console.log('Generating report with config:', reportConfig);
      
      // In a future implementation, this would call a Supabase Edge Function
      // to generate the report data
      
      // For now, we'll return a placeholder
      const reportData = {
        generatedAt: new Date().toISOString(),
        config: reportConfig,
        data: []
      };
      
      return reportData;
    } catch (error: any) {
      toastService.error('Error Generating Report', {
        description: error.message || 'There was an error generating your report. Please try again.'
      });
      throw error;
    }
  }

  /**
   * Get reports by type
   */
  async getReportsByType(type: Report['type']): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('type', type)
        .eq('status', 'active');
      
      if (error) throw error;
      return data as Report[];
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toastService.error('Error Fetching Reports', {
        description: error.message || 'There was an error loading reports. Please try again.'
      });
      return [];
    }
  }

  /**
   * Schedule a report to be sent
   */
  async scheduleReport(reportId: string, schedule: any): Promise<void> {
    try {
      const { frequency, recipients, nextDate } = schedule;
      
      const { error } = await supabase
        .from('reports')
        .update({
          frequency,
          recipients,
          next_scheduled: nextDate
        })
        .eq('id', reportId);
      
      if (error) throw error;
      
      toastService.success('Report Scheduled', {
        description: 'Your report has been scheduled and will be sent according to your settings.'
      });
    } catch (error: any) {
      toastService.error('Error Scheduling Report', {
        description: error.message || 'There was an error scheduling your report. Please try again.'
      });
      throw error;
    }
  }
  
  /**
   * Send a report now
   */
  async sendReportNow(reportId: string): Promise<void> {
    try {
      const { data: report, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Update the last_run timestamp
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          last_run: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (updateError) throw updateError;
      
      // In a real application, here we would send the report via email
      // using a Supabase Edge Function
      
      return;
    } catch (error: any) {
      console.error('Error sending report:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const reportService = new ReportService();
