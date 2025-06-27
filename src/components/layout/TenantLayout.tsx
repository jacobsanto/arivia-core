
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTenant } from '@/lib/context/TenantContext';
import TenantBranding from '@/components/common/TenantBranding';
import { LoadingState } from '@/components/ui/loading-state';

const TenantLayout: React.FC = () => {
  const { isLoading, user, tenantId } = useTenant();

  if (isLoading) {
    return <LoadingState text="Loading tenant information..." />;
  }

  if (!user || !tenantId) {
    return <div>Access denied or tenant not found</div>;
  }

  return (
    <TenantBranding>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </TenantBranding>
  );
};

export default TenantLayout;
