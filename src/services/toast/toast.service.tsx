
import { SonnerToastService } from './sonner-toast.service';
import { ShadcnToastService } from './shadcn-toast.service';
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from './toast.types';

/**
 * ToastService is a unified service for displaying toast notifications
 * It supports both Sonner and Shadcn/ui toast implementations
 */
class ToastService implements IToastService {
  private implementation: IToastService;
  private static defaultDuration = 5000; // 5 seconds default duration

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
   * Switch the toast implementation at runtime
   * @param useSonner Whether to use Sonner (true) or Shadcn/ui (false)
   */
  public switchImplementation(useSonner: boolean): void {
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
    const mergedOptions = this.applyDefaultOptions(options);
    return this.implementation.show(title, mergedOptions);
  }

  /**
   * Displays a success toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public success(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = this.applyDefaultOptions(options);
    return this.implementation.success(title, mergedOptions);
  }

  /**
   * Displays a warning toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public warning(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = this.applyDefaultOptions(options);
    return this.implementation.warning(title, mergedOptions);
  }

  /**
   * Displays an error toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public error(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = this.applyDefaultOptions(options);
    return this.implementation.error(title, mergedOptions);
  }

  /**
   * Displays a loading toast notification
   * @param title The title of the toast
   * @param options Toast options
   * @returns The toast ID that can be used to dismiss or update the toast
   */
  public loading(title: string, options?: LoadingToastOptions): ToastId {
    const mergedOptions = this.applyDefaultOptions(options);
    return this.implementation.loading(title, mergedOptions);
  }

  /**
   * Displays an info toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public info(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = this.applyDefaultOptions(options);
    return this.implementation.info(title, mergedOptions);
  }

  /**
   * Updates an existing toast notification
   * @param id The ID of the toast to update
   * @param title The new title
   * @param options The new options
   */
  public update(id: ToastId, title: string, options?: ToastOptions): void {
    const mergedOptions = this.applyDefaultOptions(options);
    this.implementation.update(id, title, mergedOptions);
  }

  /**
   * Dismisses a specific toast or all toasts
   * @param id The ID of the toast to dismiss, or undefined to dismiss all
   */
  public dismiss(id?: ToastId): void {
    this.implementation.dismiss(id);
  }

  /**
   * Apply default options to toast options
   * @param options User-provided options
   * @returns Options with defaults applied
   */
  private applyDefaultOptions<T extends ToastOptions | LoadingToastOptions>(options?: T): T {
    return {
      duration: ToastService.defaultDuration,
      ...options,
    } as T;
  }
}

// Create and export a singleton instance
export const toastService = new ToastService(true); // Using Sonner by default

// Convenience method to switch between toast implementations
export const setToastImplementation = (useSonner: boolean): IToastService => {
  const service = new ToastService(useSonner);
  return service;
};
