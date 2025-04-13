
import { SonnerToastService } from './sonner-toast.service';
import { ShadcnToastService } from './shadcn-toast.service';
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from './toast.types';

/**
 * ToastService is a unified service for displaying toast notifications
 * It supports both Sonner and Shadcn/ui toast implementations
 */
class ToastService implements IToastService {
  private implementation: IToastService;

  /**
   * Constructor for the ToastService
   * @param useSonner Whether to use Sonner (true) or Shadcn/ui (false)
   */
  constructor(useSonner: boolean = true) {
    this.implementation = useSonner 
      ? new SonnerToastService() 
      : new ShadcnToastService();
  }

  /**
   * Displays a default toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public show(title: string, options?: ToastOptions): ToastId {
    return this.implementation.show(title, options);
  }

  /**
   * Displays a success toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public success(title: string, options?: ToastOptions): ToastId {
    return this.implementation.success(title, options);
  }

  /**
   * Displays a warning toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public warning(title: string, options?: ToastOptions): ToastId {
    return this.implementation.warning(title, options);
  }

  /**
   * Displays an error toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public error(title: string, options?: ToastOptions): ToastId {
    return this.implementation.error(title, options);
  }

  /**
   * Displays a loading toast notification
   * @param title The title of the toast
   * @param options Toast options
   * @returns The toast ID that can be used to dismiss or update the toast
   */
  public loading(title: string, options?: LoadingToastOptions): ToastId {
    return this.implementation.loading(title, options);
  }

  /**
   * Displays an info toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public info(title: string, options?: ToastOptions): ToastId {
    return this.implementation.info(title, options);
  }

  /**
   * Updates an existing toast notification
   * @param id The ID of the toast to update
   * @param title The new title
   * @param options The new options
   */
  public update(id: ToastId, title: string, options?: ToastOptions): void {
    this.implementation.update(id, title, options);
  }

  /**
   * Dismisses a specific toast or all toasts
   * @param id The ID of the toast to dismiss, or undefined to dismiss all
   */
  public dismiss(id?: ToastId): void {
    this.implementation.dismiss(id);
  }
}

// Create and export a singleton instance
export const toastService = new ToastService(true); // Using Sonner by default

// Convenience method to switch between toast implementations
export const setToastImplementation = (useSonner: boolean) => {
  return new ToastService(useSonner);
};
