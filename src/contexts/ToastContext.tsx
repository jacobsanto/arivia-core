
import React, { createContext, useContext, useState, useEffect } from 'react';
import { IToastService } from '@/services/toast/toast.types';
import { toastService as defaultToastService } from '@/services/toast';
import { SonnerToastService } from '@/services/toast/sonner-toast.service';
import { ShadcnToastService } from '@/services/toast/shadcn-toast.service';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

type ToastImplementation = 'sonner' | 'shadcn';

interface ToastContextType {
  implementation: ToastImplementation;
  setImplementation: (impl: ToastImplementation) => void;
  service: IToastService;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [implementation, setImplementationState] = useState<ToastImplementation>('sonner');
  const [service, setService] = useState<IToastService>(defaultToastService);

  const setImplementation = (impl: ToastImplementation) => {
    setImplementationState(impl);
    const newService = impl === 'sonner' 
      ? new SonnerToastService()
      : new ShadcnToastService();
    setService(newService);
  };

  // Initialize with user preference or default
  useEffect(() => {
    const savedImpl = localStorage.getItem('toast-implementation') as ToastImplementation | null;
    if (savedImpl) {
      setImplementation(savedImpl);
    }
  }, []);

  // Save preference when it changes
  useEffect(() => {
    localStorage.setItem('toast-implementation', implementation);
  }, [implementation]);

  const value = {
    implementation,
    setImplementation,
    service
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Render the appropriate toaster based on implementation */}
      {implementation === 'sonner' ? (
        <SonnerToaster richColors position="top-right" />
      ) : (
        <ShadcnToaster />
      )}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  
  return context;
}

// Helper hook to directly access the toast service
export function useToastService() {
  const { service } = useToastContext();
  return service;
}
