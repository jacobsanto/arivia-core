/**
 * Reusable loading spinner with different variants
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'muted';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  text,
  fullScreen = false
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  const variantMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted-foreground'
  };
  
  const spinner = (
    <div className={cn(
      'flex items-center justify-center',
      fullScreen && 'min-h-[200px]',
      className
    )}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 
          className={cn(
            'animate-spin',
            sizeMap[size],
            variantMap[variant]
          )}
        />
        {text && (
          <p className={cn(
            'text-sm',
            variantMap[variant],
            'animate-pulse'
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  retryFn?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  error,
  children,
  loadingComponent,
  errorComponent,
  retryFn
}) => {
  if (loading) {
    return loadingComponent || <LoadingSpinner fullScreen />;
  }
  
  if (error) {
    return errorComponent || (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error</h3>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        {retryFn && (
          <button
            onClick={retryFn}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }
  
  return <>{children}</>;
};

// Skeleton loader component
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangle' | 'circle';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangle',
  animation = 'pulse'
}) => {
  const variantMap = {
    text: 'h-4 w-full rounded',
    rectangle: 'h-20 w-full rounded-md',
    circle: 'h-10 w-10 rounded-full'
  };
  
  const animationMap = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Can be extended with custom wave animation
    none: ''
  };
  
  return (
    <div
      className={cn(
        'bg-muted',
        variantMap[variant],
        animationMap[animation],
        className
      )}
    />
  );
};

// Loading overlay for individual components
export interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  text,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
};