
import { format as dateFormat } from 'date-fns';
import { exportToCSV, preparePrint } from '../reportExportUtils';
import { toastService } from '@/services/toast/toast.service';
import { ExportFormat, ExportSection } from '@/components/dashboard/ExportConfigDialog';
import { prepareDashboardExportData } from './dataPreparationUtils';

/**
 * Exports dashboard data based on specified format and selected sections
 */
export const exportDashboardData = async (
  dashboardData: any, 
  propertyFilter: string,
  exportFormat: ExportFormat = 'csv',
  sections: ExportSection[] = ['properties', 'tasks', 'maintenance', 'bookings']
) => {
  if (!dashboardData) {
    console.error("No dashboard data to export");
    toastService.error("Export failed", { 
      description: "No data available to export" 
    });
    return false;
  }

  try {
    // Show loading toast for better UX
    const loadingToastId = toastService.loading("Preparing export", {
      description: "Gathering and formatting data..."
    });
    
    // Format the data for export
    const dateStamp = dateFormat(new Date(), 'yyyy-MM-dd');
    const propertyName = propertyFilter === 'all' ? 'All_Properties' : propertyFilter.replace(/\s+/g, '_');
    const filename = `Arivia_Dashboard_${propertyName}_${dateStamp}`;
    
    // Prepare the export data from dashboard sections based on selected sections
    const exportData = prepareDashboardExportData(dashboardData, sections);
    
    // Simulate some processing time for larger exports
    if (sections.length > 3) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Export based on format
    switch (exportFormat) {
      case 'csv':
        exportToCSV(exportData, filename);
        // Dismiss loading toast and show success
        toastService.dismiss(loadingToastId);
        toastService.success("Dashboard exported as CSV", {
          description: `Data has been exported as ${filename}.csv`
        });
        break;
      case 'excel':
        // In a real app, would use a proper Excel export library
        exportToCSV(exportData, filename); // Using CSV as Excel substitute for now
        toastService.dismiss(loadingToastId);
        toastService.success("Dashboard exported as Excel", {
          description: `Data has been exported as ${filename}.csv`
        });
        break;
      case 'pdf':
        // In a real implementation, we'd generate a PDF
        // For now we'll use the print functionality as a stand-in
        preparePrint(exportData, `Arivia Dashboard - ${propertyFilter}`);
        toastService.dismiss(loadingToastId);
        toastService.success("Dashboard report prepared as PDF", {
          description: "Your report is ready to print or save as PDF"
        });
        break;
    }
    
    // Log the export for history (in a real app, this would be stored)
    console.log(`Export completed: ${filename}.${exportFormat} at ${new Date().toISOString()}`);
    
    return true;
  } catch (error) {
    console.error("Error exporting dashboard:", error);
    toastService.error("Export failed", {
      description: "There was an error exporting your dashboard data"
    });
    return false;
  }
};
