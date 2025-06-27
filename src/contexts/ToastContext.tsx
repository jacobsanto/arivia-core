
import React, { createContext, useContext } from 'react';
import { toast } from 'sonner';

interface ToastContextType {
  success: (title: string, options?: { description?: string }) => void;
  error: (title: string, options?: { description?: string }) => void;
  info: (title: string, options?: { description?: string }) => void;
  warning: (title: string, options?: { description?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
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
