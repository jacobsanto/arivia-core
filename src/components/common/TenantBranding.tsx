
import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';

interface TenantBrandingProps {
  children?: React.ReactNode;
}

const TenantBranding: React.FC<TenantBrandingProps> = ({ children }) => {
  const { tenantId } = useTenant();

  // Apply tenant-specific styling
  React.useEffect(() => {
    if (tenantId) {
      // Load tenant-specific CSS variables or styling
      document.documentElement.setAttribute('data-tenant', tenantId);
    }
  }, [tenantId]);

  return <>{children}</>;
};

export default TenantBranding;
