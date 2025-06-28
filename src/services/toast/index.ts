
// Re-export the toast service and implementation switcher
import { toastService, setToastImplementation } from './toast.service.tsx';

// Re-export the service implementations for direct access if needed
import { SonnerToastService } from './sonner-toast.service';
import { ShadcnToastService } from './shadcn-toast.service';

// Re-export types
import { 
  IToastService, 
  ToastId, 
  ToastType, 
  Toast, 
  ToastOptions, 
  LoadingToastOptions 
} from './toast.types';

// Export the toast service singleton
export { toastService };

// Export implementation switching functionality
export { setToastImplementation };

// Export service implementations
export { SonnerToastService, ShadcnToastService };

// Export types
export type {
  IToastService,
  ToastId,
  ToastType,
  Toast,
  ToastOptions,
  LoadingToastOptions
};
