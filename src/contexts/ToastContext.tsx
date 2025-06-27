
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

interface ToastContextType {
  success: (title: string, options?: { description?: string }) => void;
  error: (title: string, options?: { description?: string }) => void;
  info: (title: string, options?: { description?: string }) => void;
  warning: (title: string, options?: { description?: string }) => void;
  show: (title: string, options?: { description?: string }) => void;
  loading: (title: string, options?: { description?: string }) => string;
  dismiss: (id?: string) => void;
  implementation: string;
  setImplementation: (impl: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [implementation, setImplementation] = useState<string>('sonner');

  const success = (title: string, options?: { description?: string }) => {
    toast.success(title, options);
  };

  const error = (title: string, options?: { description?: string }) => {
    toast.error(title, options);
  };

  const info = (title: string, options?: { description?: string }) => {
    toast.info(title, options);
  };

  const warning = (title: string, options?: { description?: string }) => {
    toast.warning(title, options);
  };

  const show = (title: string, options?: { description?: string }) => {
    toast(title, options);
  };

  const loading = (title: string, options?: { description?: string }) => {
    return toast.loading(title, options);
  };

  const dismiss = (id?: string) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  };

  return (
    <ToastContext.Provider value={{ 
      success, 
      error, 
      info, 
      warning, 
      show,
      loading,
      dismiss,
      implementation,
      setImplementation
    }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Alias exports for compatibility
export const useToastContext = useToast;
export const useToastService = useToast;
