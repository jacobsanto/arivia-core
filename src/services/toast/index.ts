
// Re-export the toast service and types
import { toastService } from './toast.service';
import { 
  IToastService, 
  ToastId, 
  ToastType, 
  Toast, 
  ToastOptions, 
  LoadingToastOptions 
} from './toast.types';

// Export the toast service
export { toastService };

// Export the types for consumers
export type {
  IToastService,
  ToastId,
  ToastType,
  Toast,
  ToastOptions,
  LoadingToastOptions
};
