import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Generic loading skeleton
export const LoadingSkeleton: React.FC<{ 
  lines?: number; 
  className?: string;
  showAvatar?: boolean;
}> = ({ lines = 3, className = '', showAvatar = false }) => (
  <div className={`space-y-3 ${className}`}>
    {showAvatar && (
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    )}
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
  </div>
);

// Card loading skeleton
export const LoadingCard: React.FC<{ 
  showHeader?: boolean;
  lines?: number;
  className?: string;
}> = ({ showHeader = true, lines = 4, className = '' }) => (
  <Card className={className}>
    {showHeader && (
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
    )}
    <CardContent>
      <LoadingSkeleton lines={lines} />
    </CardContent>
  </Card>
);

// List loading skeleton
export const LoadingList: React.FC<{ 
  items?: number;
  showAvatar?: boolean;
  className?: string;
}> = ({ items = 5, showAvatar = true, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

// Table loading skeleton
export const LoadingTable: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-full" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);

// Spinner loading
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}> = ({ size = 'md', className = '', text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
};

// Full page loading
export const LoadingPage: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

// Button loading state
export const LoadingButton: React.FC<{ 
  children: React.ReactNode;
  isLoading: boolean;
  className?: string;
  disabled?: boolean;
}> = ({ children, isLoading, className = '', disabled = false }) => (
  <button 
    className={`flex items-center gap-2 ${className}`}
    disabled={isLoading || disabled}
  >
    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);