
import { SonnerToastService } from './toast/sonner-toast.service';
import { ShadcnToastService } from './toast/shadcn-toast.service';
import { IToastService } from './toast/toast.types';

// Create instances
const sonnerToastService = new SonnerToastService();
const shadcnToastService = new ShadcnToastService();

// Default to sonner
let toastService: IToastService = sonnerToastService;

// Function to switch implementation
export const setToastImplementation = (useSonner: boolean): IToastService => {
  toastService = useSonner ? sonnerToastService : shadcnToastService;
  return toastService;
};

// Export the service
export { toastService };
