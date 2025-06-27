
import { toast } from "sonner";

interface RefreshOptions {
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const createRefreshHandler = (
  refreshFn: () => Promise<void>,
  options: RefreshOptions = {}
) => {
  const {
    showToast = true,
    successMessage = "Data refreshed successfully",
    errorMessage = "Failed to refresh data"
  } = options;

  return async () => {
    let toastId: string | number | undefined;
    
    try {
      if (showToast) {
        toastId = toast.info("Refreshing data...", {
          duration: Infinity
        });
      }
      
      await refreshFn();
      
      if (showToast && toastId) {
        toast.dismiss(toastId);
        toast.success(successMessage);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
      
      if (showToast && toastId) {
        toast.dismiss(toastId);
        toast.error(errorMessage);
      }
    }
  };
};

export const withRefreshFeedback = async (
  operation: () => Promise<void>,
  loadingMessage = "Processing...",
  successMessage = "Operation completed",
  errorMessage = "Operation failed"
) => {
  const toastId = toast.info(loadingMessage, {
    duration: Infinity
  });
  
  try {
    await operation();
    toast.dismiss(toastId);
    toast.success(successMessage);
  } catch (error) {
    console.error("Operation failed:", error);
    toast.dismiss(toastId);
    toast.error(errorMessage);
    throw error;
  }
};
