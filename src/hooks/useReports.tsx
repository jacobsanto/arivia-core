
import { useState } from "react";
import { reportService, Report } from "@/services/reports/report.service";
import { toastService } from "@/services/toast/toast.service";
import { DateRange } from "@/components/reports/DateRangeSelector";

export const useReports = (reportType: Report["type"] = "task") => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Load reports of the specified type
  const loadReports = async () => {
    setIsLoading(true);
    try {
      const loadedReports = await reportService.getReportsByType(reportType);
      setReports(loadedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toastService.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new report
  const createReport = async (reportData: Partial<Report>) => {
    try {
      const newReport = await reportService.createReport({
        ...reportData,
        type: reportType,
        dateRange: {
          startDate: dateRange.from?.toISOString() || null,
          endDate: dateRange.to?.toISOString() || null,
        }
      });
      setReports([...reports, newReport]);
      return newReport;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  };
  
  // Generate a report without saving
  const generateReport = async (reportConfig: Partial<Report>) => {
    setIsGenerating(true);
    try {
      const result = await reportService.generateReport({
        ...reportConfig,
        type: reportType,
        dateRange: {
          startDate: dateRange.from?.toISOString() || null,
          endDate: dateRange.to?.toISOString() || null,
        }
      });
      setReportData(result.data || []);
      return result;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Update date range filter
  const updateDateRange = (range: DateRange) => {
    setDateRange(range);
  };
  
  // Send a scheduled report immediately
  const sendReportNow = async (reportId: string) => {
    try {
      // In a real app, this would call an API to send the report
      toastService.success('Report sent', {
        description: 'The report has been sent to recipients.'
      });
    } catch (error) {
      console.error('Error sending report:', error);
      toastService.error('Failed to send report');
    }
  };
  
  return {
    reports,
    isLoading,
    selectedReport,
    setSelectedReport,
    reportData,
    dateRange,
    isGenerating,
    loadReports,
    createReport,
    generateReport,
    updateDateRange,
    sendReportNow
  };
};
