
import { SonnerToastService } from './toast/sonner-toast.service';
import { ShadcnToastService } from './toast/shadcn-toast.service';
import { IToastService } from './toast/toast.types';
import { toastService as defaultToastService } from './toast/toast.service';

// Function to switch implementation
export const setToastImplementation = (useSonner: boolean): IToastService => {
  return useSonner ? new SonnerToastService() : new ShadcnToastService();
};

// Export the service
export { defaultToastService as toastService };
