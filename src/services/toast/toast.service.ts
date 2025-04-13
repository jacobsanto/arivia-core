
import { toast as sonnerToast } from "sonner";
import { toast } from "@/hooks/use-toast";

// Define the available types for toast
type ToastType = "default" | "success" | "warning" | "error" | "loading" | "info";

// Define the options interface for toast
interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
}

// Define special options for specific toast types
interface LoadingToastOptions extends ToastOptions {
  id?: string;
}

/**
 * ToastService is a unified service for displaying toast notifications
 * It supports both Sonner and Shadcn/ui toast implementations
 */
class ToastService {
  // Track which toast implementation is being used
  private useSonner = true;

  /**
   * Constructor for the ToastService
   * @param useSonner Whether to use Sonner (true) or Shadcn/ui (false)
   */
  constructor(useSonner: boolean = true) {
    this.useSonner = useSonner;
  }

  /**
   * Displays a default toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public show(title: string, options?: ToastOptions) {
    if (this.useSonner) {
      return sonnerToast(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      return toast({
        title,
        description: options?.description,
        action: options?.action ? {
          altText: options.action.label,
          onClick: options.action.onClick,
        } : undefined,
        duration: options?.duration,
      });
    }
  }

  /**
   * Displays a success toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public success(title: string, options?: ToastOptions) {
    if (this.useSonner) {
      return sonnerToast.success(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      return toast({
        title,
        description: options?.description,
        variant: "default", // Shadcn doesn't have success variant
        action: options?.action ? {
          altText: options.action.label,
          onClick: options.action.onClick,
        } : undefined,
        duration: options?.duration,
      });
    }
  }

  /**
   * Displays a warning toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public warning(title: string, options?: ToastOptions) {
    if (this.useSonner) {
      return sonnerToast.warning(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      // Shadcn doesn't have warning variant, use default
      return toast({
        title,
        description: options?.description,
        action: options?.action ? {
          altText: options.action.label,
          onClick: options.action.onClick,
        } : undefined,
        duration: options?.duration,
      });
    }
  }

  /**
   * Displays an error toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public error(title: string, options?: ToastOptions) {
    if (this.useSonner) {
      return sonnerToast.error(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      return toast({
        title,
        description: options?.description,
        variant: "destructive",
        action: options?.action ? {
          altText: options.action.label,
          onClick: options.action.onClick,
        } : undefined,
        duration: options?.duration,
      });
    }
  }

  /**
   * Displays a loading toast notification
   * @param title The title of the toast
   * @param options Toast options
   * @returns The toast ID that can be used to dismiss or update the toast
   */
  public loading(title: string, options?: LoadingToastOptions) {
    if (this.useSonner) {
      return sonnerToast.loading(title, {
        description: options?.description,
        id: options?.id,
        duration: options?.duration || Infinity, // Loading toasts should stay until dismissed
        position: options?.position as any,
      });
    } else {
      // Shadcn doesn't have native loading, use default with longer duration
      return toast({
        title,
        description: options?.description,
        duration: options?.duration || Infinity, // Loading toasts should stay until dismissed
      });
    }
  }

  /**
   * Displays an info toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public info(title: string, options?: ToastOptions) {
    if (this.useSonner) {
      return sonnerToast.info(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      // Shadcn doesn't have info variant, use default
      return toast({
        title,
        description: options?.description,
        action: options?.action ? {
          altText: options.action.label,
          onClick: options.action.onClick,
        } : undefined,
        duration: options?.duration,
      });
    }
  }

  /**
   * Updates an existing toast notification
   * @param id The ID of the toast to update
   * @param title The new title
   * @param options The new options
   */
  public update(id: string, title: string, options?: ToastOptions) {
    if (this.useSonner) {
      sonnerToast.update(id, {
        description: options?.description,
      });
    } else {
      // Shadcn doesn't have a direct update method
      this.dismiss(id);
      toast({
        title,
        description: options?.description,
        duration: options?.duration,
      });
    }
  }

  /**
   * Dismisses a specific toast or all toasts
   * @param id The ID of the toast to dismiss, or undefined to dismiss all
   */
  public dismiss(id?: string) {
    if (this.useSonner) {
      if (id) {
        sonnerToast.dismiss(id);
      } else {
        sonnerToast.dismiss();
      }
    } else {
      // For Shadcn/ui, toast.dismiss() already accepts an optional id
      toast.dismiss(id);
    }
  }
}

// Create and export a singleton instance
export const toastService = new ToastService(true); // Using Sonner by default

// Convenience method to switch between toast implementations
export const setToastImplementation = (useSonner: boolean) => {
  return new ToastService(useSonner);
};
