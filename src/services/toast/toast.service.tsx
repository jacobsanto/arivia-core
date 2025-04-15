
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from './toast.types';
import { ShadcnToastService } from './shadcn-toast.service';
import { SonnerToastService } from './sonner-toast.service';

// Default implementation
let currentToastImplementation: IToastService = new SonnerToastService();

// Allow switching implementations at runtime
export const setToastImplementation = (implementation: IToastService): void => {
  currentToastImplementation = implementation;
};

/**
 * Singleton toast service that delegates to the current implementation
 */
export const toastService: IToastService = {
  /**
   * Show a default toast notification
   * @param title The main message to display
   * @param options Additional configuration options
   * @returns A unique identifier for the toast
   */
  show(title: string, options?: ToastOptions): ToastId {
    return currentToastImplementation.show(title, options);
  },

  /**
   * Show a success toast notification
   * @param title The success message to display
   * @param options Additional configuration options
   * @returns A unique identifier for the toast
   */
  success(title: string, options?: ToastOptions): ToastId {
    return currentToastImplementation.success(title, options);
  },

  /**
   * Show an error toast notification
   * @param title The error message to display
   * @param options Additional configuration options
   * @returns A unique identifier for the toast
   */
  error(title: string, options?: ToastOptions): ToastId {
    return currentToastImplementation.error(title, options);
  },

  /**
   * Show a warning toast notification
   * @param title The warning message to display
   * @param options Additional configuration options
   * @returns A unique identifier for the toast
   */
  warning(title: string, options?: ToastOptions): ToastId {
    return currentToastImplementation.warning(title, options);
  },

  /**
   * Show an info toast notification
   * @param title The info message to display
   * @param options Additional configuration options
   * @returns A unique identifier for the toast
   */
  info(title: string, options?: ToastOptions): ToastId {
    return currentToastImplementation.info(title, options);
  },

  /**
   * Show a loading toast notification
   * @param title The loading message to display
   * @param options Additional configuration options
   * @returns A unique identifier for the toast
   */
  loading(title: string, options?: LoadingToastOptions): ToastId {
    return currentToastImplementation.loading(title, options);
  },

  /**
   * Update an existing toast notification
   * @param id The ID of the toast to update
   * @param title The updated message to display
   * @param options Additional configuration options
   */
  update(id: ToastId, title: string, options?: ToastOptions): void {
    currentToastImplementation.update(id, title, options);
  },

  /**
   * Dismiss one or all toast notifications
   * @param id The ID of the toast to dismiss, or undefined to dismiss all
   */
  dismiss(id?: ToastId): void {
    currentToastImplementation.dismiss(id);
  }
};

