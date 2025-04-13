
import { toast as sonnerToast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import { Toast } from "@/components/ui/use-toast";

// This utility handles both Sonner (for newer components) and Shadcn (for older components) toasts
// to ensure consistent behavior across the application

type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading";

type ToastOptions = {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
};

/**
 * Creates a unified toast service that works with both Sonner and Shadcn toast systems
 */
class ToastService {
  private shadcnToast?: ReturnType<typeof useToast>;

  /**
   * Set the Shadcn toast hook reference
   */
  setShadcnToast(toast: ReturnType<typeof useToast>) {
    this.shadcnToast = toast;
  }

  /**
   * Generic method to show a toast with specified type
   */
  showToast(message: string, type: ToastType = "default", options: ToastOptions = {}) {
    const { description, duration, action, onDismiss, onAutoClose } = options;

    // Use Sonner for modern components
    switch (type) {
      case "success":
        return sonnerToast.success(message, { description, duration, action, onDismiss, onAutoClose });
      case "error":
        return sonnerToast.error(message, { description, duration, action, onDismiss, onAutoClose });
      case "warning":
        return sonnerToast.warning(message, { description, duration, action, onDismiss, onAutoClose });
      case "info":
        return sonnerToast.info(message, { description, duration, action, onDismiss, onAutoClose });
      case "loading":
        return sonnerToast.loading(message, { description });
      default:
        return sonnerToast(message, { description, duration, action, onDismiss, onAutoClose });
    }
  }

  /**
   * Show default toast
   */
  default(message: string, options: ToastOptions = {}) {
    // For Sonner
    const id = sonnerToast(message, options);

    // For Shadcn (if available)
    if (this.shadcnToast) {
      this.shadcnToast.toast({
        title: message,
        description: options.description,
        duration: options.duration,
      });
    }

    return id;
  }

  /**
   * Show success toast
   */
  success(message: string, options: ToastOptions = {}) {
    // For Sonner
    const id = sonnerToast.success(message, options);

    // For Shadcn (if available)
    if (this.shadcnToast) {
      this.shadcnToast.toast({
        title: message,
        description: options.description,
        duration: options.duration,
        variant: "success",
      });
    }

    return id;
  }

  /**
   * Show error toast
   */
  error(message: string, options: ToastOptions = {}) {
    // For Sonner
    const id = sonnerToast.error(message, options);

    // For Shadcn (if available)
    if (this.shadcnToast) {
      this.shadcnToast.toast({
        title: message,
        description: options.description,
        duration: options.duration,
        variant: "destructive",
      });
    }

    return id;
  }

  /**
   * Show warning toast
   */
  warning(message: string, options: ToastOptions = {}) {
    // For Sonner
    const id = sonnerToast.warning(message, options);

    // For Shadcn (if available)
    if (this.shadcnToast) {
      this.shadcnToast.toast({
        title: message,
        description: options.description,
        duration: options.duration,
        variant: "destructive",
      });
    }

    return id;
  }

  /**
   * Show info toast
   */
  info(message: string, options: ToastOptions = {}) {
    // For Sonner
    const id = sonnerToast.info(message, options);

    // For Shadcn (if available)
    if (this.shadcnToast) {
      this.shadcnToast.toast({
        title: message,
        description: options.description,
        duration: options.duration,
      });
    }

    return id;
  }

  /**
   * Show loading toast
   */
  loading(message: string, options: ToastOptions = {}) {
    // For Sonner
    const id = sonnerToast.loading(message, options);

    // For Shadcn (if available)
    if (this.shadcnToast) {
      this.shadcnToast.toast({
        title: message,
        description: options.description,
        duration: options.duration || 100000, // Long duration for loading toasts
      });
    }

    return id;
  }

  /**
   * Dismiss toast by ID
   */
  dismiss(toastId: string | number) {
    // For Sonner
    sonnerToast.dismiss(toastId);

    // For Shadcn (if available)
    if (this.shadcnToast) {
      this.shadcnToast.dismiss(toastId as string);
    }
  }

  /**
   * Custom toast with specified variant
   */
  custom(message: string, options: ToastOptions & { variant?: string } = {}) {
    // For Sonner
    const id = sonnerToast(message, options);

    // For Shadcn (if available)
    if (this.shadcnToast) {
      this.shadcnToast.toast({
        title: message,
        description: options.description,
        duration: options.duration,
      });
    }

    return id;
  }

  /**
   * Promise toast that resolves/rejects based on promise outcome
   */
  promise<T>(promise: Promise<T>, messages: {
    loading: string;
    success: string;
    error: string;
  }, options: ToastOptions = {}) {
    return sonnerToast.promise(promise, messages, options);
  }
}

export const toastService = new ToastService();
