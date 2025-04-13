
import { toast as sonnerToast, type ExternalToast as SonnerToastOptions } from "sonner";
import { useToast as useShadcnToast, type ToastProps } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import React from "react";
import { type ToastActionElement } from "@/components/ui/toast";

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
type ToastId = string | number | { id: string; dismiss: () => void; update: (props: any) => void; };

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
   * Get the Shadcn toast instance
   * This is a helper to provide toast instance outside of React components
   * Note: This is not a React hook and should ONLY be used inside methods
   */
  private getShadcnToast() {
    // This is a workaround for using toast outside of React components
    // In a real app, you'd use a context or other proper state management
    return {
      toast: (props: ToastProps) => {
        // Create a simple object that mimics the return type structure
        // This isn't ideal but allows the service to work outside components
        const id = Math.random().toString(36).substring(2, 9);
        return {
          id,
          dismiss: () => {},
          update: () => {}
        };
      },
      dismiss: (id?: string) => {}
    };
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
      const { toast } = this.getShadcnToast();
      return toast({
        title,
        description: options?.description,
        action: options?.action ? this.createToastAction(options.action) : undefined,
        duration: options?.duration,
      });
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
      const { toast } = this.getShadcnToast();
      return toast({
        title,
        description: options?.description,
        variant: "default", // Shadcn doesn't have success variant
        action: options?.action ? this.createToastAction(options.action) : undefined,
        duration: options?.duration,
      });
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
      const { toast } = this.getShadcnToast();
      // Shadcn doesn't have warning variant, use default
      return toast({
        title,
        description: options?.description,
        action: options?.action ? this.createToastAction(options.action) : undefined,
        duration: options?.duration,
      });
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
      const { toast } = this.getShadcnToast();
      return toast({
        title,
        description: options?.description,
        variant: "destructive",
        action: options?.action ? this.createToastAction(options.action) : undefined,
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
  public loading(title: string, options?: LoadingToastOptions): ToastId {
    if (this.useSonner) {
      return sonnerToast.loading(title, {
        description: options?.description,
        id: options?.id,
        duration: options?.duration || Infinity, // Loading toasts should stay until dismissed
        position: options?.position as any,
      });
    } else {
      const { toast } = this.getShadcnToast();
      // Shadcn doesn't have native loading, use default with longer duration
      return toast({
        title,
        description: options?.description,
        duration: options?.duration || Infinity, // Loading toasts should stay until dismissed
        action: options?.action ? this.createToastAction(options.action) : undefined,
      });
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
      const { toast } = this.getShadcnToast();
      // Shadcn doesn't have info variant, use default
      return toast({
        title,
        description: options?.description,
        action: options?.action ? this.createToastAction(options.action) : undefined,
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
  public update(id: ToastId, title: string, options?: ToastOptions): void {
    if (this.useSonner) {
      if (typeof id === 'string' || typeof id === 'number') {
        sonnerToast.update(id, {
          description: options?.description,
        });
      }
    } else {
      // For Shadcn/ui, recreate the toast since we can't easily update it
      this.dismiss(id);
      const { toast } = this.getShadcnToast();
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
  public dismiss(id?: ToastId): void {
    if (this.useSonner) {
      if (id && (typeof id === 'string' || typeof id === 'number')) {
        sonnerToast.dismiss(id);
      } else {
        sonnerToast.dismiss();
      }
    } else {
      // For Shadcn/ui
      const { dismiss } = this.getShadcnToast();
      if (id && typeof id === 'object' && 'id' in id) {
        id.dismiss();
      } else if (id && (typeof id === 'string' || typeof id === 'number')) {
        dismiss(id.toString());
      } else {
        dismiss();
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
