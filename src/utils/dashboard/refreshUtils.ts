
import { toastService } from '@/services/toast/toast.service';

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
 * Gets the last refresh timestamp and status
 */
export const getRefreshStatus = () => {
  return {
    lastRefresh: lastRefreshTimestamp,
    sectionStatus: refreshState
  };
};

/**
 * Refreshes all dashboard data with detailed progress
 */
export const refreshDashboardData = async (callback: () => void) => {
  const refreshStartTime = new Date();
  const loadingToastId = toastService.loading("Refreshing dashboard", {
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
    if (loadingToastId) {
      toastService.dismiss(loadingToastId);
    }
    
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
        description: `All data updated as of ${new Date().toLocaleTimeString()}`
      });
      return true;
    }
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
    if (loadingToastId) {
      toastService.dismiss(loadingToastId);
    }
    toastService.error("Refresh failed", {
      description: "There was an unexpected error refreshing your dashboard data"
    });
    return false;
  }
};
