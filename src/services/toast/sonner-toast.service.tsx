
import { toast } from "sonner";
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from "./toast.types";

/**
 * Toast service implementation using Sonner
 */
export class SonnerToastService implements IToastService {
  show(title: string, options?: ToastOptions): ToastId {
    return toast(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }

  success(title: string, options?: ToastOptions): ToastId {
    return toast.success(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }

  error(title: string, options?: ToastOptions): ToastId {
    return toast.error(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }

  warning(title: string, options?: ToastOptions): ToastId {
    return toast.warning(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }

  info(title: string, options?: ToastOptions): ToastId {
    return toast.info(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }

  loading(title: string, options?: LoadingToastOptions): ToastId {
    return toast.loading(title, {
      description: options?.description,
      duration: options?.duration || 30000 // Longer default for loading toasts
    });
  }

  update(id: ToastId, title: string, options?: ToastOptions): void {
    // Sonner doesn't have a direct update method for the same ID
    // Dismiss the old toast and create a new one
    toast.dismiss(id);
    this.show(title, options);
  }

  dismiss(id?: ToastId): void {
    if (id !== undefined) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }
}
