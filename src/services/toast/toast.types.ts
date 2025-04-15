
/**
 * Type for toast identifiers - can be string or number depending on implementation
 */
export type ToastId = string | number;

/**
 * Common options for toast notifications
 */
export interface ToastOptions {
  /** Optional description text for the toast */
  description?: string;
  
  /** Duration in milliseconds to show the toast */
  duration?: number;
  
  /** Whether the toast can be dismissed by the user */
  dismissible?: boolean;
  
  /** Whether the toast is important (may affect styling/behavior) */
  important?: boolean;
  
  /** Optional action button for the toast */
  action?: {
    /** Label for the action button */
    label: string;
    
    /** Click handler for the action button */
    onClick: () => void;
  };
}

/**
 * Options specific to loading toasts
 */
export interface LoadingToastOptions {
  /** Optional description text for the loading toast */
  description?: string;
  
  /** Duration in milliseconds to show the loading toast */
  duration?: number;
}

/**
 * Types of toasts
 */
export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading' | 'task';

/**
 * Toast object structure
 */
export interface Toast {
  /** Unique identifier for the toast */
  id: ToastId;
  
  /** Main toast message */
  title: string;
  
  /** Type of toast */
  type: ToastType;
  
  /** Toast options */
  options: ToastOptions;
}

/**
 * Interface for toast service implementations
 */
export interface IToastService {
  /** Show a default toast */
  show(title: string, options?: ToastOptions): ToastId;
  
  /** Show a success toast */
  success(title: string, options?: ToastOptions): ToastId;
  
  /** Show an error toast */
  error(title: string, options?: ToastOptions): ToastId;
  
  /** Show a warning toast */
  warning(title: string, options?: ToastOptions): ToastId;
  
  /** Show an info toast */
  info(title: string, options?: ToastOptions): ToastId;
  
  /** Show a loading toast */
  loading(title: string, options?: LoadingToastOptions): ToastId;
  
  /** Update an existing toast */
  update(id: ToastId, title: string, options?: ToastOptions): void;
  
  /** Dismiss a toast or all toasts */
  dismiss(id?: ToastId): void;
}
