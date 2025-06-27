
import React from 'react';
import { useTenantBranding } from '../hooks/useTenantBranding';

interface BrandedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const BrandedLogo: React.FC<BrandedLogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const { getBrandedLogo, getBrandName } = useTenantBranding();

  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img
        src={getBrandedLogo()}
        alt={getBrandName()}
        className={sizeClasses[size]}
      />
      {showText && (
        <span className={`font-semibold text-primary ${textSizeClasses[size]}`}>
          {getBrandName()}
        </span>
      )}
    </div>
  );
};

export default BrandedLogo;
