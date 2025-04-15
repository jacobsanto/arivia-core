
import { toast as sonnerToast } from 'sonner';
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from './toast.types';

/**
 * Toast service implementation using Sonner
 */
export class SonnerToastService implements IToastService {
  public show(title: string, options?: ToastOptions): ToastId {
    return sonnerToast(title, options);
  }

  public success(title: string, options?: ToastOptions): ToastId {
    return sonnerToast.success(title, options);
  }

  public error(title: string, options?: ToastOptions): ToastId {
    return sonnerToast.error(title, options);
  }

  public warning(title: string, options?: ToastOptions): ToastId {
    return sonnerToast.warning(title, options);
  }

  public info(title: string, options?: ToastOptions): ToastId {
    return sonnerToast.info(title, options);
  }

  public loading(title: string, options?: LoadingToastOptions): ToastId {
    return sonnerToast.loading(title, options);
  }

  public update(id: ToastId, title: string, options?: ToastOptions): void {
    sonnerToast.dismiss(id);
    this.show(title, options);
  }

  public dismiss(id?: ToastId): void {
    sonnerToast.dismiss(id);
  }
}
