
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from "./toast.types";
import { toast } from "@/hooks/use-toast";

export class ShadcnToastService implements IToastService {
  show(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
    return result.id;
  }

  success(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      variant: "default", // Changed from "success" to "default"
    });
    return result.id;
  }

  error(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      variant: "destructive",
    });
    return result.id;
  }

  warning(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      variant: "default", // Changed from "warning" to "default"
    });
    return result.id;
  }

  info(title: string, options?: ToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      variant: "default",
    });
    return result.id;
  }

  loading(title: string, options?: LoadingToastOptions): ToastId {
    const result = toast({
      title,
      description: options?.description,
      duration: options?.duration || 30000,
    });
    return result.id;
  }

  update(id: ToastId, title: string, options?: ToastOptions): void {
    // Shadcn toast doesn't have built-in update functionality
    // Dismiss the old toast and create a new one
    this.dismiss(id);
    this.show(title, options);
  }

  dismiss(id?: ToastId): void {
    // Dismiss functionality in Shadcn implementation
    if (id) {
      toast.dismiss(id as string);
    } else {
      toast.dismiss();
    }
  }
}
