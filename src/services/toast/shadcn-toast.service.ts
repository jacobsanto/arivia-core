
import { toast } from "@/hooks/use-toast";
import { IToastService, ToastId, ToastOptions, LoadingToastOptions } from './toast.types';

/**
 * Toast service implementation using shadcn/ui toast
 */
export class ShadcnToastService implements IToastService {
  public show(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
    }).id;
  }

  public success(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
      variant: "default",
    }).id;
  }

  public error(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
      variant: "destructive",
    }).id;
  }

  public warning(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
      variant: "default",
    }).id;
  }

  public info(title: string, options?: ToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
      variant: "default",
    }).id;
  }

  public loading(title: string, options?: LoadingToastOptions): ToastId {
    return toast({
      title,
      description: options?.description,
      duration: options?.duration,
    }).id;
  }

  public update(id: ToastId, title: string, options?: ToastOptions): void {
    // Dismiss the existing toast and create a new one
    // Convert id to string if it's a number to match shadcn toast API
    toast.dismiss(id.toString());
    toast({
      title,
      description: options?.description,
      duration: options?.duration,
    });
  }

  public dismiss(id?: ToastId): void {
    // Dismiss a specific toast or all toasts
    // Convert id to string if it's provided to match shadcn toast API
    if (id !== undefined) {
      toast.dismiss(id.toString());
    } else {
      toast.dismiss();
    }
  }
}
