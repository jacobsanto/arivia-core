
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTenant } from '@/lib/context/TenantContext';
import TenantBranding from '@/components/common/TenantBranding';
import { LoadingState } from '@/components/ui/loading-state';

interface TenantLayoutProps {
  children: React.ReactNode;
}

const TenantLayout: React.FC<TenantLayoutProps> = ({ children }) => {
  const { tenantId } = useTenant();

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
