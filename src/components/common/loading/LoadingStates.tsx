import React from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Full page loading state
export const FullPageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex items-center justify-center min-h-[400px] p-8">
    <div className="text-center space-y-4">
      <LoadingSpinner size="large" />
      <p className="text-muted-foreground" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  </div>
);

// Card loading skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn("", className)}>
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Table loading skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 pb-2 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 py-2">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// List loading skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

// Form loading skeleton
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex gap-2 pt-4">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// Inline loading state
export const InlineLoading: React.FC<{ 
  message?: string; 
  size?: 'small' | 'medium' | 'large';
  className?: string;
}> = ({ 
  message = 'Loading...', 
  size = 'medium',
  className 
}) => (
  <div className={cn("flex items-center gap-2", className)}>
    <LoadingSpinner size={size} />
    <span className="text-sm text-muted-foreground" role="status" aria-live="polite">
      {message}
    </span>
  </div>
);

// Error state component
export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title = 'Something went wrong',
  message = 'Unable to load the requested data.',
  onRetry,
  className
}) => (
  <div className={cn("text-center py-8", className)}>
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-destructive">{title}</h3>
      <p className="text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="Retry loading"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);