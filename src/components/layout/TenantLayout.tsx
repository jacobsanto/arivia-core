
import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { LoadingState } from '@/components/ui/loading-state';

interface TenantLayoutProps {
  children: React.ReactNode;
}

const TenantLayout: React.FC<TenantLayoutProps> = ({ children }) => {
  const { tenantId, isLoading } = useTenant();

  if (isLoading) {
    return <LoadingState />;
  }

  // Always render children - tenantId defaults to 'arivia-villas'
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
};

export default TenantLayout;
