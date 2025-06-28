
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

interface TenantContextType {
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: React.ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string | null>('arivia-villas'); // Default tenant
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && user) {
      // For now, use default tenant for all users
      // In future, could extract from user profile or domain
      setTenantId('arivia-villas');
      setIsLoading(false);
    } else if (!userLoading && !user) {
      // Still provide default tenant even when not logged in
      setTenantId('arivia-villas');
      setIsLoading(false);
    }
  }, [user, userLoading]);

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
