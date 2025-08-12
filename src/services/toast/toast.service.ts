
import { toast } from "sonner";

interface ToastProps {
  description?: string;
  duration?: number;
}

interface RetryOptions extends ToastProps {
  retryLabel?: string;
  onRetry: () => void | Promise<void>;
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

  // Standardized patterns
  errorWithRetry(title: string, options: RetryOptions) {
    toast.error(title, {
      description: options.description,
      duration: options.duration || 6000,
      action: {
        label: options.retryLabel || "Retry",
        onClick: async () => {
          try {
            await options.onRetry();
            this.success("Retried successfully");
          } catch (e) {
            this.error("Retry failed", { description: e instanceof Error ? e.message : undefined });
          }
        },
      },
    } as any);
  }

  networkError(onRetry?: () => void | Promise<void>) {
    if (onRetry) {
      this.errorWithRetry("Network error", {
        description: "Please check your connection and try again.",
        onRetry,
      });
    } else {
      this.error("Network error", { description: "Please try again later." });
    }
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
