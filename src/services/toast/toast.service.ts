
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
