
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  className?: string;
  color?: 'primary' | 'secondary' | 'muted';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
  color = 'primary'
}) => {
  const sizeClasses = {
    xsmall: 'h-3 w-3 border-[1.5px]',
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-[3px]'
  };
  
  const colorClasses = {
    primary: 'border-t-primary',
    secondary: 'border-t-secondary',
    muted: 'border-t-muted-foreground'
  };
  
  return (
    <div className={cn(`flex justify-center items-center`, className)}>
      <div className={cn(
        `animate-spin rounded-full border-solid border-muted-foreground/20`,
        sizeClasses[size],
        colorClasses[color]
      )}/>
    </div>
  );
};
