
import { toast } from "sonner";
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from "./toast.types";

export class SonnerToastService implements IToastService {
  show(title: string, options?: ToastOptions): ToastId {
    return toast(title, options);
  }

  success(title: string, options?: ToastOptions): ToastId {
    return toast.success(title, options);
  }

  error(title: string, options?: ToastOptions): ToastId {
    return toast.error(title, options);
  }

  warning(title: string, options?: ToastOptions): ToastId {
    return toast.warning(title, options);
  }

  info(title: string, options?: ToastOptions): ToastId {
    return toast.info(title, options);
  }

  loading(title: string, options?: LoadingToastOptions): ToastId {
    return toast.loading(title, options);
  }

  update(id: ToastId, title: string, options?: ToastOptions): void {
    toast.update(id, { ...options, description: options?.description });
  }

  dismiss(id?: ToastId): void {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }
}
