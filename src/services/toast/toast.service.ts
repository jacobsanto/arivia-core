
import { toast } from "sonner";

interface ToastProps {
  description?: string;
  duration?: number;
}

class ToastService {
  success(title: string, props?: ToastProps) {
    toast.success(title, {
      description: props?.description,
      duration: props?.duration || 4000,
    });
  }

  error(title: string, props?: ToastProps) {
    toast.error(title, {
      description: props?.description,
      duration: props?.duration || 5000,
    });
  }

  info(title: string, props?: ToastProps) {
    toast.info(title, {
      description: props?.description,
      duration: props?.duration || 4000,
    });
  }

  warning(title: string, props?: ToastProps) {
    toast.warning(title, {
      description: props?.description,
      duration: props?.duration || 4500,
    });
  }

  custom(title: string, props?: ToastProps & { icon?: React.ReactNode }) {
    toast(title, {
      description: props?.description,
      duration: props?.duration || 4000,
      icon: props?.icon,
    });
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    props?: ToastProps
  ) {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      duration: props?.duration || 4000,
    });
  }
}

export const toastService = new ToastService();
