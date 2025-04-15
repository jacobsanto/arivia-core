
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from "./toast.types";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import * as React from "react";
import type { ToastActionElement } from "@/components/ui/toast";

export class ShadcnToastService implements IToastService {
  show(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? this.convertToToastAction(options.action) : undefined,
    });
    return result.id;
  }

  success(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? this.convertToToastAction(options.action) : undefined,
      variant: "default", // Using default as success
    });
    return result.id;
  }

  error(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? this.convertToToastAction(options.action) : undefined,
      variant: "destructive",
    });
    return result.id;
  }

  warning(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? this.convertToToastAction(options.action) : undefined,
      variant: "default", // Using default for warning
    });
    return result.id;
  }

  info(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? this.convertToToastAction(options.action) : undefined,
      variant: "default",
    });
    return result.id;
  }

  loading(title: string, options?: LoadingToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration || 30000,
    });
    return result.id;
  }

  update(id: ToastId, title: string, options?: ToastOptions): void {
    // Shadcn toast doesn't have built-in update functionality
    // Dismiss the old toast and create a new one
    this.dismiss(id);
    this.show(title, options);
  }

  dismiss(id?: ToastId): void {
    if (id) {
      // For shadcn toast, we need to access the dismiss function from the useToast hook
      if (typeof id === 'string') {
        // Using the imported toast function's dismiss method
        const { dismiss } = toast;
        dismiss(id);
      }
    } else {
      // To dismiss all toasts when no ID is provided
      const { dismiss } = toast;
      dismiss();
    }
  }

  // Helper method to convert ReactNode to ToastAction component
  private convertToToastAction(action: React.ReactNode): ToastActionElement | undefined {
    if (!action) return undefined;
    if (React.isValidElement(action)) return action as ToastActionElement;
    
    // If it's not a valid React element, we can't use it in the toast
    console.warn("Invalid toast action provided. Must be a valid React element.");
    return undefined;
  }
}
