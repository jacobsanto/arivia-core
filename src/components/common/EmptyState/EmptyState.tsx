import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Search, FileX, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };
  className?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon = FileX, title, description, action, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center p-8 space-y-4",
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-md">{description}</p>
          )}
        </div>

        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

// Predefined empty states for common scenarios
export const NoDataEmptyState = ({ 
  entity = "data", 
  action,
  ...props 
}: { 
  entity?: string; 
  action?: EmptyStateProps['action'] 
} & Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
  <EmptyState
    icon={FileX}
    title={`No ${entity} found`}
    description={`There is no ${entity} to display at the moment.`}
    action={action}
    {...props}
  />
);

export const SearchEmptyState = ({ 
  searchTerm, 
  onClear,
  ...props 
}: { 
  searchTerm?: string; 
  onClear?: () => void;
} & Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'action'>) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description={searchTerm ? `No results found for "${searchTerm}"` : "Try adjusting your search criteria"}
    action={onClear ? {
      label: "Clear search",
      onClick: onClear,
      variant: "outline"
    } : undefined}
    {...props}
  />
);

export const ErrorEmptyState = ({ 
  onRetry,
  error = "Something went wrong",
  ...props 
}: { 
  onRetry?: () => void;
  error?: string;
} & Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'action'>) => (
  <EmptyState
    icon={AlertCircle}
    title="Unable to load data"
    description={error}
    action={onRetry ? {
      label: "Try again",
      onClick: onRetry,
      variant: "outline"
    } : undefined}
    {...props}
  />
);

export const CreateFirstEmptyState = ({ 
  entity = "item",
  onCreate,
  ...props 
}: { 
  entity?: string; 
  onCreate?: () => void;
} & Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'action'>) => (
  <EmptyState
    icon={Plus}
    title={`Create your first ${entity}`}
    description={`Get started by creating your first ${entity}.`}
    action={onCreate ? {
      label: `Create ${entity}`,
      onClick: onCreate
    } : undefined}
    {...props}
  />
);