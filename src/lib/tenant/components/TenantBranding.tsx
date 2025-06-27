
import React, { useEffect } from 'react';
import { useTenant } from '../TenantContext';

interface TenantBrandingProps {
  children: React.ReactNode;
}

const TenantBranding: React.FC<TenantBrandingProps> = ({ children }) => {
  const { branding, isLoading } = useTenant();

  useEffect(() => {
    if (branding && !isLoading) {
      // Apply Tailwind CSS custom properties
      const root = document.documentElement;
      
      // Convert hex colors to RGB for Tailwind CSS variables
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };

      const primaryRgb = hexToRgb(branding.primary_color);
      const secondaryRgb = hexToRgb(branding.secondary_color);
      const accentRgb = hexToRgb(branding.accent_color);

      if (primaryRgb) {
        root.style.setProperty('--color-primary', `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);
      }
      if (secondaryRgb) {
        root.style.setProperty('--color-secondary', `${secondaryRgb.r} ${secondaryRgb.g} ${secondaryRgb.b}`);
      }
      if (accentRgb) {
        root.style.setProperty('--color-accent', `${accentRgb.r} ${accentRgb.g} ${accentRgb.b}`);
      }

      // Apply custom properties
      Object.entries(branding.custom_properties).forEach(([key, value]) => {
        root.style.setProperty(`--tenant-${key}`, value);
      });
    }
  }, [branding, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default TenantBranding;
