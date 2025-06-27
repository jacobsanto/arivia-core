
import React from 'react';
import { useTenant } from '@/lib/tenant/TenantContext';

interface TenantBrandingProps {
  children?: React.ReactNode;
}

const TenantBranding: React.FC<TenantBrandingProps> = ({ children }) => {
  const { tenantId, branding } = useTenant();

  // Apply tenant-specific styling
  React.useEffect(() => {
    if (tenantId && branding) {
      // Set tenant data attribute for CSS targeting
      document.documentElement.setAttribute('data-tenant', tenantId);
      
      // Apply CSS custom properties for dynamic theming
      const root = document.documentElement;
      root.style.setProperty('--tenant-primary', branding.primary_color);
      root.style.setProperty('--tenant-secondary', branding.secondary_color);
      root.style.setProperty('--tenant-accent', branding.accent_color);
      root.style.setProperty('--tenant-background', branding.background_color);
      root.style.setProperty('--tenant-text', branding.text_color);
    }
  }, [tenantId, branding]);

  return <>{children}</>;
};

export default TenantBranding;
