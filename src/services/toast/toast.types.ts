
export type ToastId = string;

export interface ToastOptions {
  description?: string;
  duration?: number;
  dismissible?: boolean;
  important?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingToastOptions {
  description?: string;
  duration?: number;
}

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'task';

export interface Toast {
  id: string;
  title: string;
  type: ToastType;
  options: ToastOptions;
}

export interface IToastService {
  show(title: string, options?: ToastOptions): ToastId;
  success(title: string, options?: ToastOptions): ToastId;
  error(title: string, options?: ToastOptions): ToastId;
  warning(title: string, options?: ToastOptions): ToastId;
  info(title: string, options?: ToastOptions): ToastId;
  loading(title: string, options?: LoadingToastOptions): ToastId;
  update(id: ToastId, title: string, options?: ToastOptions): void;
  dismiss(id?: ToastId): void;
}
