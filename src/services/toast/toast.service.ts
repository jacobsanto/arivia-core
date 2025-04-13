
import { toast as sonnerToast } from "sonner";
import { toast as shadcnToast } from "@/hooks/use-toast";
import { ToastActionElement } from "@/components/ui/toast";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";
type ToastPosition = "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";

interface ToastOptions {
  description?: string;
  action?: ToastActionElement;
  duration?: number;
  position?: ToastPosition;
  variant?: ToastVariant;
}

/**
 * Unified Toast Service
 * 
 * This service standardizes toast notifications across the application by
 * providing a consistent interface that works with both Sonner and Shadcn toasts.
 * 
 * The default implementation uses Sonner for simplicity and better animations,
 * but falls back to Shadcn toasts if needed.
 */
class ToastService {
  // Default to Sonner as primary toast provider
  private useSonner = true;
  
  // Storage for loading toast IDs to allow dismissal
  private loadingToasts = new Map<string, string|number>();

  /**
   * Show a toast notification
   */
  show(title: string, options?: ToastOptions) {
    if (this.useSonner) {
      return this.showSonnerToast(title, options);
    } else {
      return this.showShadcnToast(title, options);
    }
  }

  /**
   * Show a success toast notification
   */
  success(title: string, options?: Omit<ToastOptions, 'variant'>) {
    return this.show(title, { ...options, variant: 'success' });
  }

  /**
   * Show an error toast notification
   */
  error(title: string, options?: Omit<ToastOptions, 'variant'>) {
    return this.show(title, { ...options, variant: 'destructive' });
  }

  /**
   * Show a warning toast notification
   */
  warning(title: string, options?: Omit<ToastOptions, 'variant'>) {
    return this.show(title, { ...options, variant: 'warning' });
  }

  /**
   * Show an info toast notification
   */
  info(title: string, options?: Omit<ToastOptions, 'variant'>) {
    return this.show(title, { ...options, variant: 'info' });
  }

  /**
   * Show a loading toast notification
   * Returns an ID that can be used to dismiss the toast
   */
  loading(title: string, options?: Omit<ToastOptions, 'variant'>) {
    const id = Math.random().toString(36).substring(2, 9);
    
    if (this.useSonner) {
      const toastId = sonnerToast.loading(title, { 
        description: options?.description,
        duration: options?.duration || 100000,  // Long duration for loading toasts
        position: options?.position
      });
      this.loadingToasts.set(id, toastId);
    } else {
      // For shadcn, we use the standard toast but remember the ID
      const result = this.show(title, { 
        ...options, 
        variant: 'default',
        duration: options?.duration || 100000  // Long duration for loading toasts
      });
      // Check if result has an id property before accessing it
      const resultId = typeof result === 'object' && result !== null && 'id' in result ? result.id : '';
      this.loadingToasts.set(id, resultId);
    }
    
    return id;
  }

  /**
   * Dismiss a toast by ID
   */
  dismiss(id: string) {
    if (this.useSonner) {
      if (this.loadingToasts.has(id)) {
        // Dismiss the specific loading toast
        const toastId = this.loadingToasts.get(id);
        if (toastId) sonnerToast.dismiss(toastId);
        this.loadingToasts.delete(id);
      } else {
        // If it's not a stored loading toast, try to dismiss directly
        sonnerToast.dismiss(id);
      }
    } else {
      // Using shadcn toast
      // Get the toast dismiss function from shadcn
      const { dismiss } = shadcnToast();
      
      if (this.loadingToasts.has(id)) {
        const toastId = this.loadingToasts.get(id);
        // Shadcn dismiss function requires the toast id
        if (toastId) dismiss(toastId.toString());
        this.loadingToasts.delete(id);
      } else {
        // Direct dismiss - ensure we pass the id
        dismiss(id);
      }
    }
  }

  /**
   * Set the toast provider to use
   */
  setProvider(provider: 'sonner' | 'shadcn') {
    this.useSonner = provider === 'sonner';
  }

  /**
   * Get the currently active toast provider
   */
  getProvider(): 'sonner' | 'shadcn' {
    return this.useSonner ? 'sonner' : 'shadcn';
  }

  /**
   * Show a toast using Sonner
   */
  private showSonnerToast(title: string, options?: ToastOptions) {
    const { description, duration, position, variant } = options || {};
    
    switch (variant) {
      case 'success':
        return sonnerToast.success(title, { description, duration, position });
      case 'destructive':
        return sonnerToast.error(title, { description, duration, position });
      case 'warning':
        return sonnerToast.warning(title, { description, duration, position });  
      case 'info':
        // Note: Sonner doesn't have a direct info method, so we use a custom one
        return sonnerToast(title, { 
          description, 
          duration, 
          position,
          // For info style, we can add a custom style if needed
          className: "bg-blue-50 border-blue-200"
        });
      default:
        return sonnerToast(title, { description, duration, position });
    }
  }

  /**
   * Show a toast using Shadcn toast
   */
  private showShadcnToast(title: string, options?: ToastOptions) {
    const { description, action, variant } = options || {};
    
    // Map our variants to shadcn's limited variants
    let shadcnVariant: "default" | "destructive" = "default";
    if (variant === "destructive") {
      shadcnVariant = "destructive";
    }
    
    return shadcnToast({
      title,
      description,
      action, // Make sure action is properly typed as ToastActionElement
      variant: shadcnVariant,
    });
  }
}

// Export a singleton instance
export const toastService = new ToastService();
