
import { toast as sonnerToast } from 'sonner';
import { ToastId, ToastOptions, LoadingToastOptions, ToastType } from './toast.types';

const defaultToastOptions: ToastOptions = {
  duration: 5000,
  dismissible: true,
};

export class ToastService {
  show(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast(title, mergedOptions);
  }

  success(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast.success(title, mergedOptions);
  }

  error(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast.error(title, mergedOptions);
  }

  warning(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast.warning(title, mergedOptions);
  }

  info(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast.info(title, mergedOptions);
  }

  loading(title: string, options?: LoadingToastOptions): ToastId {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast.loading(title, mergedOptions);
  }

  update(id: ToastId, title: string, options?: ToastOptions): void {
    // Dismiss the old toast and create a new one
    this.dismiss(id);
    this.show(title, options);
  }

  dismiss(id?: ToastId): void {
    if (id) {
      sonnerToast.dismiss(id);
    } else {
      sonnerToast.dismiss();
    }
  }

  // Custom method for Arivia-specific toast needs
  task(title: string, options?: ToastOptions): ToastId {
    const mergedOptions = { 
      ...defaultToastOptions, 
      ...options,
      // Apply any Arivia-specific styling
    };
    return sonnerToast(title, mergedOptions);
  }
}

// Create and export a singleton instance
export const toastService = new ToastService();
