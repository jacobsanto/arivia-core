
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTenant } from '@/lib/tenant/TenantContext';
import TenantBranding from '@/lib/tenant/components/TenantBranding';
import { LoadingState } from '@/components/ui/loading-state';

interface TenantLayoutProps {
  children: React.ReactNode;
}

const TenantLayout: React.FC<TenantLayoutProps> = ({ children }) => {
  const { tenantId, isLoading } = useTenant();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!tenantId) {
    return <div>Access denied or tenant not found</div>;
  }

  return (
    <TenantBranding>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </TenantBranding>
  );
};

export default TenantLayout;
