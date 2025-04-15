
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from "./toast.types";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import * as React from "react";

/**
 * Toast service implementation using shadcn/ui toast components
 */
export class ShadcnToastService implements IToastService {
  show(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? 
        <ToastAction altText={options.action.label} onClick={options.action.onClick}>
          {options.action.label}
        </ToastAction> : undefined,
    });
    return result.id;
  }

  success(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? 
        <ToastAction altText={options.action.label} onClick={options.action.onClick}>
          {options.action.label}
        </ToastAction> : undefined,
      variant: "default", // Using default as success
    });
    return result.id;
  }

  error(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? 
        <ToastAction altText={options.action.label} onClick={options.action.onClick}>
          {options.action.label}
        </ToastAction> : undefined,
      variant: "destructive",
    });
    return result.id;
  }

  warning(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? 
        <ToastAction altText={options.action.label} onClick={options.action.onClick}>
          {options.action.label}
        </ToastAction> : undefined,
      variant: "default", // Using default for warning
    });
    return result.id;
  }

  info(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? 
        <ToastAction altText={options.action.label} onClick={options.action.onClick}>
          {options.action.label}
        </ToastAction> : undefined,
      variant: "default",
    });
    return result.id;
  }

  loading(title: string, options?: LoadingToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration || 30000, // Longer default for loading toasts
    });
    return result.id;
  }

  update(id: ToastId, title: string, options?: ToastOptions): void {
    // Shadcn toast doesn't have built-in update functionality
    // Dismiss the old toast and create a new one
    toast.dismiss(id.toString());
    this.show(title, options);
  }

  dismiss(id?: ToastId): void {
    if (id !== undefined) {
      toast.dismiss(id.toString());
    } else {
      toast.dismiss();
    }
  }
}
