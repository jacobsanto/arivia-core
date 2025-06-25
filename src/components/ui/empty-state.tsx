
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className,
  compact = false 
}) => {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "p-4" : "p-8"
      )}>
        {Icon && (
          <Icon className={cn(
            "text-muted-foreground mb-3",
            compact ? "h-8 w-8" : "h-12 w-12"
          )} />
        )}
        <h3 className={cn(
          "font-medium mb-2",
          compact ? "text-base" : "text-lg"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-muted-foreground mb-4 max-w-sm",
          compact ? "text-sm" : "text-base"
        )}>
          {description}
        </p>
        {action && (
          <Button
            variant={action.variant || 'default'}
            onClick={action.onClick}
            size={compact ? 'sm' : 'default'}
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
