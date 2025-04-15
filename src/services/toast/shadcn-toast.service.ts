
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from "./toast.types";
import { toast } from "@/hooks/use-toast";

export class ShadcnToastService implements IToastService {
  show(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  }

  success(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      variant: "success",
    });
  }

  error(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      variant: "destructive",
    });
  }

  warning(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      variant: "warning",
    });
  }

  info(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      variant: "default",
    });
  }

  loading(title: string, options?: LoadingToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration || 30000,
    });
  }

  update(id: ToastId, title: string, options?: ToastOptions): void {
    // Shadcn toast doesn't have built-in update functionality
    // Dismiss the old toast and create a new one
    this.dismiss(id);
    this.show(title, options);
  }

  dismiss(id?: ToastId): void {
    // Dismiss functionality is limited in Shadcn implementation
    // We can only close all toasts or use external references
    toast.dismiss(id as string);
  }
}
