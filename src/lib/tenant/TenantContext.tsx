
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TenantContextType, TenantBranding } from '@/types/tenant';
import { TenantService } from './services/TenantService';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshBranding = async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    try {
      const brandingData = await TenantService.getTenantBranding(tenantId);
      setBranding(brandingData);
      
      // Apply branding to document
      if (brandingData) {
        TenantService.applyBrandingToDocument(brandingData);
      }
    } catch (error) {
      console.error('Failed to load tenant branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBranding = async (updates: Partial<TenantBranding>): Promise<boolean> => {
    if (!tenantId || !branding) return false;
    
    try {
      const updated = await TenantService.updateTenantBranding(tenantId, updates);
      if (updated) {
        setBranding(prev => prev ? { ...prev, ...updates } : null);
        // Apply updated branding immediately
        TenantService.applyBrandingToDocument({ ...branding, ...updates });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update tenant branding:', error);
      return false;
    }
  };

  useEffect(() => {
    if (tenantId) {
      refreshBranding();
    }
  }, [tenantId]);

  // Auto-detect tenant ID from URL or localStorage
  useEffect(() => {
    const detectTenantId = () => {
      // Try to get from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const urlTenantId = urlParams.get('tenant');
      
      if (urlTenantId) {
        setTenantId(urlTenantId);
        localStorage.setItem('tenantId', urlTenantId);
        return;
      }
      
      // Try to get from localStorage
      const storedTenantId = localStorage.getItem('tenantId');
      if (storedTenantId) {
        setTenantId(storedTenantId);
        return;
      }
      
      // Default tenant ID (for demo purposes)
      const defaultTenantId = 'arivia-villas';
      setTenantId(defaultTenantId);
      localStorage.setItem('tenantId', defaultTenantId);
    };

    detectTenantId();
  }, []);

  const value: TenantContextType = {
    tenantId,
    branding,
    isLoading,
    setTenantId,
    updateBranding,
    refreshBranding
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
