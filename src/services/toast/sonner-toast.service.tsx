
import { toast } from "sonner";
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from "./toast.types";

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
      duration: options?.duration
    });
  }

  update(id: ToastId, title: string, options?: ToastOptions): void {
    // Manually handle update since sonner doesn't have direct TypeScript support for this
    toast.dismiss(id);
    this.show(title, options);
  }

  dismiss(id?: ToastId): void {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }
}
