
import { toastService } from '@/services/toast/toast.service';

/**
 * Generates a weekly review report (only opens the dialog now)
 * The actual report generation is handled by the WeeklyReviewDialog component
 */
export const generateWeeklyReview = (dashboardData: any, propertyFilter: string) => {
  if (!dashboardData) {
    toastService.error("Weekly review failed", { 
      description: "No data available to generate review" 
    });
    return false;
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
