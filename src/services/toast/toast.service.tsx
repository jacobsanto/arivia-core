
import { toast as sonnerToast } from "sonner";
import { useToast, toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import React from "react";
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast";
import { type ToasterToast } from "@/hooks/use-toast";

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

// Type for toast ID returned by different toast libraries
type ToastId = string | number;

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
  public show(title: string, options?: ToastOptions): ToastId {
    if (this.useSonner) {
      return sonnerToast(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      const { id } = toast({
        title,
        description: options?.description,
        action: options?.action ? this.createToastAction(options.action) : undefined,
        duration: options?.duration,
      });
      return id;
    }
  }

  /**
   * Displays a success toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public success(title: string, options?: ToastOptions): ToastId {
    if (this.useSonner) {
      return sonnerToast.success(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      const { id } = toast({
        title,
        description: options?.description,
        variant: "default", // Shadcn doesn't have success variant
        action: options?.action ? this.createToastAction(options.action) : undefined,
        duration: options?.duration,
      });
      return id;
    }
  }

  /**
   * Displays a warning toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public warning(title: string, options?: ToastOptions): ToastId {
    if (this.useSonner) {
      return sonnerToast.warning(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      // Shadcn doesn't have warning variant, use default
      const { id } = toast({
        title,
        description: options?.description,
        action: options?.action ? this.createToastAction(options.action) : undefined,
        duration: options?.duration,
      });
      return id;
    }
  }

  /**
   * Displays an error toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public error(title: string, options?: ToastOptions): ToastId {
    if (this.useSonner) {
      return sonnerToast.error(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      const { id } = toast({
        title,
        description: options?.description,
        variant: "destructive",
        action: options?.action ? this.createToastAction(options.action) : undefined,
        duration: options?.duration,
      });
      return id;
    }
  }

  /**
   * Displays a loading toast notification
   * @param title The title of the toast
   * @param options Toast options
   * @returns The toast ID that can be used to dismiss or update the toast
   */
  public loading(title: string, options?: LoadingToastOptions): ToastId {
    if (this.useSonner) {
      return sonnerToast.loading(title, {
        description: options?.description,
        id: options?.id,
        duration: options?.duration || Infinity, // Loading toasts should stay until dismissed
        position: options?.position as any,
      });
    } else {
      // Shadcn doesn't have native loading, use default with longer duration
      const { id } = toast({
        title,
        description: options?.description,
        duration: options?.duration || Infinity, // Loading toasts should stay until dismissed
        action: options?.action ? this.createToastAction(options.action) : undefined,
      });
      return id;
    }
  }

  /**
   * Displays an info toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public info(title: string, options?: ToastOptions): ToastId {
    if (this.useSonner) {
      return sonnerToast.info(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
        position: options?.position as any,
      });
    } else {
      // Shadcn doesn't have info variant, use default
      const { id } = toast({
        title,
        description: options?.description,
        action: options?.action ? this.createToastAction(options.action) : undefined,
        duration: options?.duration,
      });
      return id;
    }
  }

  /**
   * Updates an existing toast notification
   * @param id The ID of the toast to update
   * @param title The new title
   * @param options The new options
   */
  public update(id: ToastId, title: string, options?: ToastOptions): void {
    if (this.useSonner) {
      sonnerToast.update(id, {
        description: options?.description,
      });
    } else {
      // Shadcn doesn't have a direct update method on the imported toast
      // For Shadcn, dismiss the old toast and create a new one
      const { toast: toastFn } = useToast();
      toastFn.dismiss?.(id.toString());
      toastFn({
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
  public dismiss(id?: ToastId): void {
    if (this.useSonner) {
      if (id) {
        sonnerToast.dismiss(id);
      } else {
        sonnerToast.dismiss();
      }
    } else {
      // For Shadcn/ui we need to use the hook's dismiss method directly
      const { toast: toastFn } = useToast();
      if (id) {
        toastFn.dismiss?.(id.toString());
      } else {
        toastFn.dismiss?.();
      }
    }
  }

  /**
   * Creates a ToastAction component for shadcn/ui toasts
   * @param action The action configuration
   * @returns A ToastAction component
   */
  private createToastAction(action: { label: string; onClick: () => void }): ToastActionElement {
    return (
      <ToastAction altText={action.label} onClick={action.onClick}>
        {action.label}
      </ToastAction>
    );
  }
}

// Create and export a singleton instance
export const toastService = new ToastService(true); // Using Sonner by default

// Convenience method to switch between toast implementations
export const setToastImplementation = (useSonner: boolean) => {
  return new ToastService(useSonner);
};
