
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

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'task';

export interface Toast {
  id: string;
  title: string;
  type: ToastType;
  options: ToastOptions;
}
