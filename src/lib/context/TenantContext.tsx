
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TenantContextType {
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  const setTenantId = (id: string | null) => {
    setTenantIdState(id);
    if (id) {
      localStorage.setItem('tenantId', id);
    } else {
      localStorage.removeItem('tenantId');
    }
  };

  useEffect(() => {
    const detectTenantId = () => {
      // Try to get from URL params first
      const urlParams = new URLSearchParams(window.location.search);
      const urlTenantId = urlParams.get('tenant');
      
      if (urlTenantId) {
        setTenantId(urlTenantId);
        return;
      }
      
      // Try to get from localStorage
      const storedTenantId = localStorage.getItem('tenantId');
      if (storedTenantId) {
        setTenantIdState(storedTenantId);
        return;
      }
      
      // Set default tenant ID for Arivia Villas
      const defaultTenantId = 'arivia-villas';
      setTenantId(defaultTenantId);
    };

    detectTenantId();
  }, []);

  const value: TenantContextType = {
    tenantId,
    setTenantId
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
