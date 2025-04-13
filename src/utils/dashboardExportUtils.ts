
import { format } from 'date-fns';
import { exportToCSV, preparePrint } from './reportExportUtils';
import { toastService } from '@/services/toast/toast.service';

/**
 * Exports dashboard data based on specified format
 */
export const exportDashboardData = (
  dashboardData: any, 
  propertyFilter: string,
  format: 'csv' | 'pdf' | 'excel' = 'csv'
) => {
  if (!dashboardData) {
    console.error("No dashboard data to export");
    toastService.error("Export failed", { 
      description: "No data available to export" 
    });
    return;
  }

  try {
    // Format the data for export
    const dateStamp = format(new Date(), 'yyyy-MM-dd');
    const propertyName = propertyFilter === 'all' ? 'All_Properties' : propertyFilter.replace(/\s+/g, '_');
    const filename = `Arivia_Dashboard_${propertyName}_${dateStamp}`;
    
    // Prepare the export data from dashboard sections
    const exportData = prepareDashboardExportData(dashboardData);
    
    // Export based on format
    switch (format) {
      case 'csv':
        exportToCSV(exportData, filename);
        toastService.success("Dashboard exported", {
          description: `Data has been exported as ${filename}.csv`
        });
        break;
      case 'pdf':
        // In a real implementation, we'd generate a PDF
        // For now we'll use the print functionality as a stand-in
        preparePrint(exportData, `Arivia Dashboard - ${propertyFilter}`);
        toastService.success("Dashboard report prepared", {
          description: "Your report is ready to print or save as PDF"
        });
        break;
      case 'excel':
        exportToCSV(exportData, filename); // Using CSV as Excel substitute for now
        toastService.success("Dashboard exported", {
          description: `Data has been exported as ${filename}.csv`
        });
        break;
    }
    
    return true;
  } catch (error) {
    console.error("Error exporting dashboard:", error);
    toastService.error("Export failed", {
      description: "There was an error exporting your dashboard data"
    });
    return false;
  }
};

/**
 * Refreshes all dashboard data
 */
export const refreshDashboardData = async (callback: () => void) => {
  toastService.info("Refreshing dashboard", {
    description: "Fetching latest data from all sources"
  });
  
  try {
    // In a real app, you'd refresh data from APIs here
    // Simulating API call with timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    callback();
    
    toastService.success("Dashboard refreshed", {
      description: "All data has been updated with latest information"
    });
    return true;
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
    toastService.error("Refresh failed", {
      description: "There was an error refreshing your dashboard data"
    });
    return false;
  }
};

/**
 * Generates a weekly review report
 */
export const generateWeeklyReview = (dashboardData: any, propertyFilter: string) => {
  if (!dashboardData) {
    toastService.error("Weekly review failed", { 
      description: "No data available to generate review" 
    });
    return;
  }
  
  try {
    // In a real implementation, we'd generate a comprehensive report
    // For now we'll prepare a simple formatted data set for display
    const exportData = prepareDashboardExportData(dashboardData);
    
    // Use the print function as a stand-in for generating a report
    preparePrint(
      exportData, 
      `Arivia Weekly Review - ${propertyFilter === 'all' ? 'All Properties' : propertyFilter}`
    );
    
    toastService.success("Weekly review generated", {
      description: "Your weekly review report is ready to view"
    });
    
    return true;
  } catch (error) {
    console.error("Error generating weekly review:", error);
    toastService.error("Weekly review failed", {
      description: "There was an error generating your weekly review"
    });
    return false;
  }
};

/**
 * Prepares dashboard data for export
 */
const prepareDashboardExportData = (dashboardData: any) => {
  const exportData: any[] = [];
  
  // Process property stats
  if (dashboardData.properties) {
    exportData.push(
      { 
        Section: 'Properties', 
        Metric: 'Total',
        Value: dashboardData.properties.total
      },
      { 
        Section: 'Properties', 
        Metric: 'Occupied',
        Value: dashboardData.properties.occupied
      },
      { 
        Section: 'Properties', 
        Metric: 'Vacant',
        Value: dashboardData.properties.vacant
      }
    );
  }
  
  // Process task stats
  if (dashboardData.tasks) {
    exportData.push(
      { 
        Section: 'Tasks', 
        Metric: 'Total',
        Value: dashboardData.tasks.total
      },
      { 
        Section: 'Tasks', 
        Metric: 'Completed',
        Value: dashboardData.tasks.completed
      },
      { 
        Section: 'Tasks', 
        Metric: 'Pending',
        Value: dashboardData.tasks.pending
      }
    );
  }
  
  // Process maintenance stats
  if (dashboardData.maintenance) {
    exportData.push(
      { 
        Section: 'Maintenance', 
        Metric: 'Total',
        Value: dashboardData.maintenance.total
      },
      { 
        Section: 'Maintenance', 
        Metric: 'Critical',
        Value: dashboardData.maintenance.critical
      },
      { 
        Section: 'Maintenance', 
        Metric: 'Standard',
        Value: dashboardData.maintenance.standard
      }
    );
  }
  
  return exportData;
};
