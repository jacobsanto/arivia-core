import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Memoized Card Component
export const MemoizedCard = React.memo<{
  title: string;
  content: React.ReactNode;
  className?: string;
}>(({ title, content, className }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{content}</CardContent>
  </Card>
));

MemoizedCard.displayName = 'MemoizedCard';

// Memoized Badge Component
export const MemoizedBadge = React.memo<{
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}>(({ children, variant = 'default', className }) => (
  <Badge variant={variant} className={className}>
    {children}
  </Badge>
));

MemoizedBadge.displayName = 'MemoizedBadge';

// Memoized Avatar Component
export const MemoizedAvatar = React.memo<{
  src?: string;
  alt?: string;
  fallback: string;
  className?: string;
}>(({ src, alt, fallback, className }) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt={alt} />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
));

MemoizedAvatar.displayName = 'MemoizedAvatar';

// Memoized List Item
export const MemoizedListItem = React.memo<{
  id: string | number;
  title: string;
  subtitle?: string;
  avatar?: string;
  status?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
}>(({ id, title, subtitle, avatar, status, actions, onClick }) => (
  <div 
    className="flex items-center justify-between p-4 border-b hover:bg-accent/50 transition-colors cursor-pointer"
    onClick={onClick}
    key={id}
  >
    <div className="flex items-center space-x-3">
      {avatar && (
        <MemoizedAvatar
          src={avatar}
          fallback={title.substring(0, 2).toUpperCase()}
          className="h-10 w-10"
        />
      )}
      <div>
        <p className="font-medium">{title}</p>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center space-x-2">
      {status && <MemoizedBadge>{status}</MemoizedBadge>}
      {actions}
    </div>
  </div>
));

MemoizedListItem.displayName = 'MemoizedListItem';

// Performance monitoring component
export const PerformanceMonitor = React.memo<{
  componentName: string;
  children: React.ReactNode;
}>(({ componentName, children }) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  return <>{children}</>;
});

PerformanceMonitor.displayName = 'PerformanceMonitor';