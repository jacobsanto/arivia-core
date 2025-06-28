
import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';

interface TenantLayoutProps {
  children: React.ReactNode;
}

const TenantLayout: React.FC<TenantLayoutProps> = ({ children }) => {
  const { tenantId } = useTenant();

  // Always render children - tenantId will be set by TenantProvider
  // No need to show loading or access denied since we have a default tenant
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
};

export default TenantLayout;
