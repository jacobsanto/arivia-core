
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';

interface TenantContextType {
  tenantId: string | null;
  user: User | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      // For now, use a default tenant ID. In a real app, this would come from user data
      setTenantId('default-tenant');
      setIsLoading(false);
    } else if (!authLoading && !user) {
      setTenantId(null);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const value = {
    tenantId,
    user,
    isLoading: isLoading || authLoading
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
