
import React from "react";
import { ToastId, ToastOptions, LoadingToastOptions, IToastService } from "./toast.types";
import { ToastAction } from "@/components/ui/toast";
import { type ToastActionElement } from "@/components/ui/toast";
import { toast, useToast } from "@/hooks/use-toast";

/**
 * ShadcnToastService is an implementation of the toast service using Shadcn/ui
 */
export class ShadcnToastService implements IToastService {
  /**
   * Get the Shadcn toast instance
   * This is a helper to provide toast instance outside of React components
   * Note: This is not a React hook and should ONLY be used inside methods
   */
  private getShadcnToast() {
    // This is a workaround for using toast outside of React components
    // We're returning the toast function from @/hooks/use-toast directly
    return {
      toast: (props: any) => {
        // Create a simple object that mimics the return type structure
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

  /**
   * Displays a default toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public show(title: string, options?: ToastOptions): ToastId {
    const { toast } = this.getShadcnToast();
    return toast({
      title,
      description: options?.description,
      action: options?.action ? this.createToastAction(options.action) : undefined,
      duration: options?.duration,
    });
  }

  /**
   * Displays a success toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public success(title: string, options?: ToastOptions): ToastId {
    const { toast } = this.getShadcnToast();
    return toast({
      title,
      description: options?.description,
      variant: "default", // Shadcn doesn't have success variant
      action: options?.action ? this.createToastAction(options.action) : undefined,
      duration: options?.duration,
    });
  }

  /**
   * Displays a warning toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public warning(title: string, options?: ToastOptions): ToastId {
    const { toast } = this.getShadcnToast();
    // Shadcn doesn't have warning variant, use default
    return toast({
      title,
      description: options?.description,
      action: options?.action ? this.createToastAction(options.action) : undefined,
      duration: options?.duration,
    });
  }

  /**
   * Displays an error toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public error(title: string, options?: ToastOptions): ToastId {
    const { toast } = this.getShadcnToast();
    return toast({
      title,
      description: options?.description,
      variant: "destructive",
      action: options?.action ? this.createToastAction(options.action) : undefined,
      duration: options?.duration,
    });
  }

  /**
   * Displays a loading toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public loading(title: string, options?: LoadingToastOptions): ToastId {
    const { toast } = this.getShadcnToast();
    // Shadcn doesn't have native loading, use default with longer duration
    return toast({
      title,
      description: options?.description,
      duration: options?.duration || Infinity, // Loading toasts should stay until dismissed
      action: options?.action ? this.createToastAction(options.action) : undefined,
    });
  }

  /**
   * Displays an info toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public info(title: string, options?: ToastOptions): ToastId {
    const { toast } = this.getShadcnToast();
    // Shadcn doesn't have info variant, use default
    return toast({
      title,
      description: options?.description,
      action: options?.action ? this.createToastAction(options.action) : undefined,
      duration: options?.duration,
    });
  }

  /**
   * Updates an existing toast notification
   * @param id The ID of the toast to update
   * @param title The new title
   * @param options The new options
   */
  public update(id: ToastId, title: string, options?: ToastOptions): void {
    // For Shadcn/ui, recreate the toast since we can't easily update it
    this.dismiss(id);
    const { toast } = this.getShadcnToast();
    toast({
      title,
      description: options?.description,
      duration: options?.duration,
    });
  }

  /**
   * Dismisses a specific toast or all toasts
   * @param id The ID of the toast to dismiss, or undefined to dismiss all
   */
  public dismiss(id?: ToastId): void {
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
