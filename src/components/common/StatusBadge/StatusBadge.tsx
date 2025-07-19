import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        error: "bg-destructive/10 text-destructive border border-destructive/20",
        info: "bg-info/10 text-info border border-info/20",
        pending: "bg-muted text-muted-foreground border border-border",
        completed: "bg-success/10 text-success border border-success/20",
        cancelled: "bg-destructive/10 text-destructive border border-destructive/20",
        active: "bg-primary/10 text-primary border border-primary/20",
        inactive: "bg-muted/50 text-muted-foreground border border-border",
      },
      size: {
        sm: "px-2 py-0.5 text-2xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  icon?: LucideIcon;
  pulse?: boolean;
}

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, variant, size, children, icon: Icon, pulse = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          statusBadgeVariants({ variant, size }),
          pulse && "animate-pulse",
          className
        )}
        ref={ref}
        {...props}
      >
        {Icon && <Icon className="h-3 w-3" />}
        {children}
      </div>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

// Predefined status components for common use cases
export const TaskStatusBadge = ({ status, ...props }: { status: string } & Omit<StatusBadgeProps, 'variant' | 'children'>) => {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'completed';
      case 'pending':
      case 'todo':
        return 'pending';
      case 'in_progress':
      case 'in progress':
        return 'info';
      case 'cancelled':
      case 'canceled':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  return (
    <StatusBadge variant={getVariant(status)} {...props}>
      {status.replace('_', ' ')}
    </StatusBadge>
  );
};

export const PropertyStatusBadge = ({ status, ...props }: { status: string } & Omit<StatusBadgeProps, 'variant' | 'children'>) => {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return 'active';
      case 'inactive':
      case 'unavailable':
        return 'inactive';
      case 'occupied':
        return 'info';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <StatusBadge variant={getVariant(status)} {...props}>
      {status}
    </StatusBadge>
  );
};

export const BookingStatusBadge = ({ status, ...props }: { status: string } & Omit<StatusBadgeProps, 'variant' | 'children'>) => {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'canceled':
        return 'error';
      case 'checked_in':
      case 'checked in':
        return 'info';
      case 'checked_out':
      case 'checked out':
        return 'completed';
      default:
        return 'default';
    }
  };

  return (
    <StatusBadge variant={getVariant(status)} {...props}>
      {status.replace('_', ' ')}
    </StatusBadge>
  );
};