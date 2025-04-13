
import { ToastId, ToastOptions, LoadingToastOptions, IToastService } from "./toast.types";
import { type ToastActionElement } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";

/**
 * ShadcnToastService is an implementation of the toast service using Shadcn/ui
 */
export class ShadcnToastService implements IToastService {
  /**
   * Creates a ToastAction object for shadcn/ui toasts
   * @param action The action configuration
   * @returns A ToastAction element descriptor
   */
  private createToastAction(action: { label: string; onClick: () => void }): ToastActionElement {
    return {
      altText: action.label,
      onClick: action.onClick,
      children: action.label
    } as unknown as ToastActionElement;
  }

  /**
   * Displays a default toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public show(title: string, options?: ToastOptions): ToastId {
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
    return toast({
      title,
      description: options?.description,
      variant: "default",
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
    return toast({
      title,
      description: options?.description,
      duration: options?.duration || Infinity,
    });
  }

  /**
   * Displays an info toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public info(title: string, options?: ToastOptions): ToastId {
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
    if (id) {
      if (typeof id === 'object' && 'dismiss' in id) {
        id.dismiss();
      } else {
        // No direct way to dismiss by ID in shadcn/ui toast
        // This is a limitation of the current implementation
      }
    } else {
      // Dismiss all toasts - not directly supported in shadcn/ui
    }
  }
}
