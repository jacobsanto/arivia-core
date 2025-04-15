
import { toast as sonnerToast } from 'sonner';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  description?: string;
  duration?: number;
  dismissible?: boolean;
  important?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const defaultToastOptions: ToastOptions = {
  duration: 5000,
  dismissible: true,
};

export const toast = {
  show: (title: string, options?: ToastOptions) => {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast(title, mergedOptions);
  },

  success: (title: string, options?: ToastOptions) => {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast.success(title, mergedOptions);
  },

  error: (title: string, options?: ToastOptions) => {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast.error(title, mergedOptions);
  },

  warning: (title: string, options?: ToastOptions) => {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast.warning(title, mergedOptions);
  },

  info: (title: string, options?: ToastOptions) => {
    const mergedOptions = { ...defaultToastOptions, ...options };
    return sonnerToast.info(title, mergedOptions);
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  },

  // Custom method for Arivia-specific toast needs
  task: (title: string, options?: ToastOptions) => {
    const mergedOptions = { 
      ...defaultToastOptions, 
      ...options,
      // Apply any Arivia-specific styling
    };
    return sonnerToast(title, mergedOptions);
  }
};

export type { ToastType };
