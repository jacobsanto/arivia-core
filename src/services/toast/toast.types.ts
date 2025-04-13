
import { type ToastActionElement } from "@/components/ui/toast";

// Define the available types for toast
export type ToastType = "default" | "success" | "warning" | "error" | "loading" | "info";

// Define the options interface for toast
export interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
}

// Define special options for specific toast types
export interface LoadingToastOptions extends ToastOptions {
  id?: string;
}

// Type for toast ID returned by different toast libraries
export type ToastId = string | number | { id: string; dismiss: () => void; update: (props: any) => void; };

// Interface for toast service implementation
export interface IToastService {
  show(title: string, options?: ToastOptions): ToastId;
  success(title: string, options?: ToastOptions): ToastId;
  warning(title: string, options?: ToastOptions): ToastId;
  error(title: string, options?: ToastOptions): ToastId;
  loading(title: string, options?: LoadingToastOptions): ToastId;
  info(title: string, options?: ToastOptions): ToastId;
  update(id: ToastId, title: string, options?: ToastOptions): void;
  dismiss(id?: ToastId): void;
}
