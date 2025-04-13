
import { toast as sonnerToast } from "sonner";
import { ToastId, ToastOptions, LoadingToastOptions, IToastService } from "./toast.types";

/**
 * SonnerToastService is an implementation of the toast service using Sonner
 */
export class SonnerToastService implements IToastService {
  /**
   * Displays a default toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public show(title: string, options?: ToastOptions): ToastId {
    return sonnerToast(title, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration,
      position: options?.position as any,
    });
  }

  /**
   * Displays a success toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public success(title: string, options?: ToastOptions): ToastId {
    return sonnerToast.success(title, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration,
      position: options?.position as any,
    });
  }

  /**
   * Displays a warning toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public warning(title: string, options?: ToastOptions): ToastId {
    return sonnerToast.warning(title, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration,
      position: options?.position as any,
    });
  }

  /**
   * Displays an error toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public error(title: string, options?: ToastOptions): ToastId {
    return sonnerToast.error(title, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration,
      position: options?.position as any,
    });
  }

  /**
   * Displays a loading toast notification
   * @param title The title of the toast
   * @param options Loading toast options
   */
  public loading(title: string, options?: LoadingToastOptions): ToastId {
    return sonnerToast.loading(title, {
      description: options?.description,
      id: options?.id,
      duration: options?.duration || Infinity, // Loading toasts should stay until dismissed
      position: options?.position as any,
    });
  }

  /**
   * Displays an info toast notification
   * @param title The title of the toast
   * @param options Toast options
   */
  public info(title: string, options?: ToastOptions): ToastId {
    return sonnerToast.info(title, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration,
      position: options?.position as any,
    });
  }

  /**
   * Updates an existing toast notification
   * @param id The ID of the toast to update
   * @param title The new title
   * @param options The new options
   */
  public update(id: ToastId, title: string, options?: ToastOptions): void {
    if (typeof id === 'string' || typeof id === 'number') {
      // For sonner, we can directly update using the ID
      sonnerToast.dismiss(id);
      this.show(title, options);
    }
  }

  /**
   * Dismisses a specific toast or all toasts
   * @param id The ID of the toast to dismiss, or undefined to dismiss all
   */
  public dismiss(id?: ToastId): void {
    if (id && (typeof id === 'string' || typeof id === 'number')) {
      sonnerToast.dismiss(id);
    } else if (id && typeof id === 'object' && 'id' in id) {
      sonnerToast.dismiss(id.id);
    } else {
      sonnerToast.dismiss();
    }
  }
}
