/**
 * Mobile-first responsive components and utilities
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  as?: React.ElementType;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  mobileClassName,
  desktopClassName,
  as: Component = 'div'
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Component
      className={cn(
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
    >
      {children}
    </Component>
  );
};

export interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const MobileStack: React.FC<MobileStackProps> = ({
  children,
  className,
  spacing = 'md'
}) => {
  const spacingMap = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  };
  
  return (
    <div className={cn(
      'flex flex-col',
      spacingMap[spacing],
      className
    )}>
      {children}
    </div>
  );
};

export interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2;
  gap?: 'sm' | 'md' | 'lg';
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  className,
  columns = 1,
  gap = 'md'
}) => {
  const gapMap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  const columnMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2'
  };
  
  return (
    <div className={cn(
      'grid',
      columnMap[columns],
      gapMap[gap],
      'md:grid-cols-3 lg:grid-cols-4', // Responsive breakpoints
      className
    )}>
      {children}
    </div>
  );
};

export interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className,
  padding = 'md',
  variant = 'default'
}) => {
  const paddingMap = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const variantMap = {
    default: 'bg-card',
    outlined: 'bg-card border border-border',
    elevated: 'bg-card shadow-sm border border-border'
  };
  
  return (
    <div className={cn(
      'rounded-lg',
      paddingMap[padding],
      variantMap[variant],
      className
    )}>
      {children}
    </div>
  );
};

export interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  as?: React.ElementType;
  onClick?: () => void;
  [key: string]: any; // Allow forwarding of additional props
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  className,
  size = 'md',
  as: Component = 'button',
  onClick,
  ...props
}) => {
  const sizeMap = {
    sm: 'min-h-[44px] min-w-[44px]', // iOS guideline minimum
    md: 'min-h-[48px] min-w-[48px]', // Material Design minimum
    lg: 'min-h-[56px] min-w-[56px]'  // Large touch target
  };
  
  return (
    <Component
      className={cn(
        'flex items-center justify-center',
        'touch-manipulation', // Optimize for touch
        'active:scale-95 transition-transform', // Touch feedback
        sizeMap[size],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  className,
  top = false,
  bottom = false
}) => {
  return (
    <div className={cn(
      top && 'pt-safe-top',
      bottom && 'pb-safe-bottom',
      className
    )}>
      {children}
    </div>
  );
};

// Utility hook for responsive breakpoints
export const useResponsiveBreakpoint = () => {
  const isMobile = useIsMobile();
  
  return {
    isMobile,
    isTablet: !isMobile && window.innerWidth < 1024,
    isDesktop: !isMobile && window.innerWidth >= 1024,
    isLarge: !isMobile && window.innerWidth >= 1280
  };
};