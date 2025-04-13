
import { format as dateFormat } from 'date-fns';
import { exportToCSV, preparePrint } from './reportExportUtils';
import { toastService } from '@/services/toast/toast.service';
import { ExportFormat, ExportSection } from '@/components/dashboard/ExportConfigDialog';

// Track when data was last refreshed
let lastRefreshTimestamp = new Date();
const refreshState = {
  properties: { success: true, timestamp: new Date() },
  tasks: { success: true, timestamp: new Date() },
  maintenance: { success: true, timestamp: new Date() },
  bookings: { success: true, timestamp: new Date() },
  system: { success: true, timestamp: new Date() }
};

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
    const loadingToast = toastService.loading("Preparing export", {
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
        toastService.dismiss(loadingToast);
        toastService.success("Dashboard exported as CSV", {
          description: `Data has been exported as ${filename}.csv`
        });
        break;
      case 'excel':
        // In a real app, would use a proper Excel export library
        exportToCSV(exportData, filename); // Using CSV as Excel substitute for now
        toastService.dismiss(loadingToast);
        toastService.success("Dashboard exported as Excel", {
          description: `Data has been exported as ${filename}.csv`
        });
        break;
      case 'pdf':
        // In a real implementation, we'd generate a PDF
        // For now we'll use the print functionality as a stand-in
        preparePrint(exportData, `Arivia Dashboard - ${propertyFilter}`);
        toastService.dismiss(loadingToast);
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

/**
 * Refreshes all dashboard data with detailed progress
 */
export const refreshDashboardData = async (callback: () => void) => {
  const refreshStartTime = new Date();
  const loadingToast = toastService.loading("Refreshing dashboard", {
    description: "Fetching latest data from all sources..."
  });
  
  try {
    // Track which sections need refresh
    const sectionsToRefresh = ['properties', 'tasks', 'maintenance', 'bookings', 'system'];
    const results: Record<string, boolean> = {};
    let hasErrors = false;
    
    // In a real app, these would be actual API calls
    // Here we're simulating async refreshes for each section
    await Promise.all(sectionsToRefresh.map(async (section) => {
      try {
        // Simulate varying load times to make it more realistic
        const loadTime = 1000 + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, loadTime));
        
        // Small chance of simulated error (10%)
        if (Math.random() > 0.9) {
          throw new Error(`Failed to refresh ${section} data`);
        }
        
        // Update refresh state for this section
        refreshState[section] = { success: true, timestamp: new Date() };
        results[section] = true;
      } catch (err) {
        console.error(`Error refreshing ${section} data:`, err);
        hasErrors = true;
        refreshState[section] = { success: false, timestamp: refreshStartTime };
        results[section] = false;
      }
    }));
    
    // Update last refresh timestamp
    lastRefreshTimestamp = new Date();
    
    // Call the callback to update UI
    callback();
    
    // Dismiss loading toast
    toastService.dismiss(loadingToast);
    
    // Show appropriate toast based on results
    if (hasErrors) {
      const failedSections = Object.entries(results)
        .filter(([_, success]) => !success)
        .map(([section]) => section);
      
      toastService.error("Partial refresh completed", {
        description: `Some data couldn't be updated: ${failedSections.join(', ')}`
      });
      return false;
    } else {
      toastService.success("Dashboard refreshed", {
        description: `All data updated as of ${dateFormat(lastRefreshTimestamp, 'HH:mm:ss')}`
      });
      return true;
    }
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
    toastService.dismiss(loadingToast);
    toastService.error("Refresh failed", {
      description: "There was an unexpected error refreshing your dashboard data"
    });
    return false;
  }
};

/**
 * Gets the last refresh timestamp and status
 */
export const getRefreshStatus = () => {
  return {
    lastRefresh: lastRefreshTimestamp,
    sectionStatus: refreshState
  };
};

/**
 * Generates a weekly review report (only opens the dialog now)
 * The actual report generation is handled by the WeeklyReviewDialog component
 */
export const generateWeeklyReview = (dashboardData: any, propertyFilter: string) => {
  if (!dashboardData) {
    toastService.error("Weekly review failed", { 
      description: "No data available to generate review" 
    });
    return;
  }
  
  try {
    // The actual report generation happens in the WeeklyReviewDialog component
    // This function now simply returns true to indicate success
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
 * Schedules a weekly review report for automated delivery
 */
export const scheduleWeeklyReview = (propertyFilter: string, emailRecipients: string[], dayOfWeek: string, time: string) => {
  try {
    // In a real app, this would create a scheduled task in the backend
    toastService.success("Weekly review scheduled", {
      description: `Report will be delivered to ${emailRecipients.length} recipients every ${dayOfWeek} at ${time}`
    });
    return true;
  } catch (error) {
    console.error("Error scheduling weekly review:", error);
    toastService.error("Scheduling failed", {
      description: "There was an error scheduling your weekly review"
    });
    return false;
  }
};

/**
 * Prepares dashboard data for export based on selected sections
 */
const prepareDashboardExportData = (dashboardData: any, sections: ExportSection[]) => {
  const exportData: any[] = [];
  
  // Process property stats
  if (sections.includes('properties') && dashboardData.properties) {
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
  if (sections.includes('tasks') && dashboardData.tasks) {
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
  if (sections.includes('maintenance') && dashboardData.maintenance) {
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
  
  // Process bookings data
  if (sections.includes('bookings') && dashboardData.bookings) {
    dashboardData.bookings.forEach((booking: any) => {
      exportData.push({
        Section: 'Bookings',
        Metric: `Bookings in ${booking.month}`,
        Value: booking.bookings
      });
    });
  }
  
  // Process activity logs
  if (sections.includes('activity') && dashboardData.upcomingTasks) {
    dashboardData.upcomingTasks.forEach((task: any, index: number) => {
      exportData.push({
        Section: 'Activity',
        Metric: `Task ${index + 1}`,
        Value: `${task.title} (${task.dueDate})`
      });
    });
  }
  
  // Process system data - simulated for now
  if (sections.includes('system')) {
    exportData.push(
      {
        Section: 'System',
        Metric: 'Status',
        Value: 'Operational'
      },
      {
        Section: 'System',
        Metric: 'Uptime',
        Value: '99.9%'
      },
      {
        Section: 'System',
        Metric: 'Last Sync',
        Value: dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss')
      }
    );
  }
  
  return exportData;
};
