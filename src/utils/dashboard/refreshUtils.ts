
import { toastService } from '@/services/toast';
import { ToastId } from '@/services/toast/toast.types';

/**
 * Refreshes dashboard data with loading indicator and success message
 */
export const refreshDashboardData = async (
  refreshFn: () => Promise<any>,
  options: {
    silent?: boolean;
    successMessage?: string;
    errorMessage?: string;
  } = {}
) => {
  const {
    silent = false,
    successMessage = "Dashboard refreshed",
    errorMessage = "Failed to refresh dashboard"
  } = options;
  
  let loadingToastId: ToastId | undefined;
  
  try {
    // Show loading toast if not silent
    if (!silent) {
      loadingToastId = toastService.loading("Refreshing dashboard", {
        description: "Getting the latest data..."
      });
    }
    
    // Call the refresh function
    const result = await refreshFn();
    
    // Show success toast if not silent
    if (!silent) {
      toastService.dismiss(loadingToastId);
      toastService.success(successMessage, {
        description: "Your dashboard is now up-to-date"
      });
    }
    
    return result;
  } catch (error) {
    console.error("Dashboard refresh error:", error);
    
    // Show error toast if not silent
    if (!silent) {
      toastService.dismiss(loadingToastId);
      toastService.error(errorMessage, {
        description: "There was a problem getting the latest data"
      });
    }
    
    return null;
  }
};

/**
 * Performs automatic dashboard refresh on a schedule
 */
export const setupAutoRefresh = (
  refreshFn: () => Promise<any>,
  intervalMinutes: number = 5
) => {
  // Initial refresh
  refreshDashboardData(refreshFn, { silent: true });
  
  // Setup interval refresh
  const intervalId = setInterval(() => {
    refreshDashboardData(refreshFn, { 
      silent: true,
      successMessage: "Auto-refresh complete",
      errorMessage: "Auto-refresh failed"
    });
  }, intervalMinutes * 60 * 1000);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

/**
 * Create a helper function to prepare dashboard for refresh operations
 * Renamed to avoid conflict with dataPreparationUtils.ts
 */
export const prepareRefreshData = (
  dashboardData: any,
  sections: string[] = ['properties', 'tasks', 'maintenance', 'bookings']
) => {
  const exportData: Record<string, any[]> = {};
  
  sections.forEach(section => {
    if (dashboardData && dashboardData[section]) {
      exportData[section] = dashboardData[section];
    }
  });
  
  return exportData;
};
