
// Types for toast service
import { type ToastActionElement } from "@/components/ui/toast";

export type ToastOptions = {
  description?: string;
  duration?: number;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  action?: {
    label: string;
    onClick: () => void;
  };
  id?: string;
};

export type LoadingToastOptions = ToastOptions & {
  id?: string; // For referencing the toast later
};

// ToastId can be a string, number, or an object with dismiss and update methods
export type ToastId = string | number | { 
  id: string | number; 
  dismiss: () => void; 
  update: (props: any) => void 
};

// Interface for toast services
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
