
import { useTenant } from '../TenantContext';
import { TenantBranding } from '@/types/tenant';

export const useTenantBranding = () => {
  const { branding, isLoading, updateBranding, refreshBranding } = useTenant();

  const getBrandedColor = (colorType: keyof Pick<TenantBranding, 'primary_color' | 'secondary_color' | 'accent_color'>) => {
    return branding?.[colorType] || '#3B82F6';
  };

  const getBrandedStyle = (property: string) => {
    return branding?.custom_properties?.[property];
  };

  const getBrandedLogo = () => {
    return branding?.logo_url || '/arivia-logo-full-dark-bg.png';
  };

  const getBrandName = () => {
    return branding?.brand_name || 'Arivia Villas';
  };

  const getTailwindClass = (baseClass: string, branded: boolean = true) => {
    if (!branded || !branding) return baseClass;
    
    // Custom Tailwind class mapping based on branding
    const brandedClasses: Record<string, string> = {
      'bg-primary': `bg-[${branding.primary_color}]`,
      'text-primary': `text-[${branding.primary_color}]`,
      'border-primary': `border-[${branding.primary_color}]`,
      'bg-secondary': `bg-[${branding.secondary_color}]`,
      'text-secondary': `text-[${branding.secondary_color}]`,
      'bg-accent': `bg-[${branding.accent_color}]`,
      'text-accent': `text-[${branding.accent_color}]`,
    };

    return brandedClasses[baseClass] || baseClass;
  };

  return {
    branding,
    isLoading,
    updateBranding,
    refreshBranding,
    getBrandedColor,
    getBrandedStyle,
    getBrandedLogo,
    getBrandName,
    getTailwindClass
  };
};
