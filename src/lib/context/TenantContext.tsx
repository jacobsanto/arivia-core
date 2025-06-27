
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantUser } from '@/types/auth';
import { AuthService } from '@/lib/auth/authService';

interface TenantContextType {
  user: TenantUser | null;
  tenantId: string | null;
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TenantUser | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize tenant context
    const initializeTenant = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setTenantId(currentUser.tenantId);
        }
      } catch (error) {
        console.error('Failed to initialize tenant context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTenant();
  }, []);

  const switchTenant = async (newTenantId: string) => {
    setIsLoading(true);
    try {
      // Implementation for tenant switching
      setTenantId(newTenantId);
      // Refresh user data for new tenant
      const updatedUser = await AuthService.getCurrentUser();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
    setTenantId(null);
  };

  return (
    <TenantContext.Provider value={{
      user,
      tenantId,
      isLoading,
      switchTenant,
      signOut
    }}>
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
