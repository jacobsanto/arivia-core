
export type ToastId = string | number;

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: React.ReactNode;
}

export interface LoadingToastOptions extends ToastOptions {
  onDismiss?: () => void;
}

export interface IToastService {
  show: (title: string, options?: ToastOptions) => ToastId;
  success: (title: string, options?: ToastOptions) => ToastId;
  error: (title: string, options?: ToastOptions) => ToastId;
  warning: (title: string, options?: ToastOptions) => ToastId;
  info: (title: string, options?: ToastOptions) => ToastId;
  loading: (title: string, options?: LoadingToastOptions) => ToastId;
  update: (id: ToastId, title: string, options?: ToastOptions) => void;
  dismiss: (id?: ToastId) => void;
}
