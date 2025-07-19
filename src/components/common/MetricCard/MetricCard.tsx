import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metricCardVariants = cva(
  "transition-all duration-200",
  {
    variants: {
      variant: {
        default: "hover:shadow-md",
        elevated: "shadow-md hover:shadow-lg",
        flat: "",
        gradient: "bg-gradient-primary text-primary-foreground hover:shadow-glow",
      },
      size: {
        sm: "",
        md: "",
        lg: "p-6",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  loading?: boolean;
  action?: React.ReactNode;
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    loading = false,
    action,
    ...props 
  }, ref) => {
    const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
      switch (direction) {
        case 'up':
          return TrendingUp;
        case 'down':
          return TrendingDown;
        default:
          return Minus;
      }
    };

    const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
      switch (direction) {
        case 'up':
          return 'text-success';
        case 'down':
          return 'text-destructive';
        default:
          return 'text-muted-foreground';
      }
    };

    if (loading) {
      return (
        <Card className={cn(metricCardVariants({ variant, size }), className)} ref={ref} {...props}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      );
    }

    const TrendIcon = trend ? getTrendIcon(trend.direction) : null;

    return (
      <Card className={cn(metricCardVariants({ variant, size }), className)} ref={ref} {...props}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {action}
            {Icon && (
              <Icon className={cn(
                "h-4 w-4",
                variant === 'gradient' ? "text-primary-foreground/80" : "text-muted-foreground"
              )} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className={cn(
                "text-2xl font-bold",
                variant === 'gradient' ? "text-primary-foreground" : "text-foreground"
              )}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {description && (
                <p className={cn(
                  "text-xs",
                  variant === 'gradient' ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {description}
                </p>
              )}
            </div>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                variant === 'gradient' ? "text-primary-foreground/80" : getTrendColor(trend.direction)
              )}>
                {TrendIcon && <TrendIcon className="h-3 w-3" />}
                <span>{Math.abs(trend.value)}%</span>
                {trend.period && (
                  <span className={cn(
                    "text-xs",
                    variant === 'gradient' ? "text-primary-foreground/60" : "text-muted-foreground"
                  )}>
                    {trend.period}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

MetricCard.displayName = "MetricCard";

// Predefined metric cards for common use cases
export const PropertyMetricCard = ({ properties, ...props }: { properties: { total: number; occupied: number; vacant: number } } & Omit<MetricCardProps, 'title' | 'value'>) => {
  const occupancyRate = properties.total > 0 ? Math.round((properties.occupied / properties.total) * 100) : 0;
  
  return (
    <MetricCard
      title="Property Occupancy"
      value={`${occupancyRate}%`}
      description={`${properties.occupied} of ${properties.total} properties`}
      trend={{
        value: occupancyRate,
        direction: occupancyRate >= 80 ? 'up' : occupancyRate >= 60 ? 'neutral' : 'down',
      }}
      {...props}
    />
  );
};

export const TaskMetricCard = ({ tasks, ...props }: { tasks: { total: number; completed: number; pending: number } } & Omit<MetricCardProps, 'title' | 'value'>) => {
  const completionRate = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;
  
  return (
    <MetricCard
      title="Task Completion"
      value={`${completionRate}%`}
      description={`${tasks.completed} of ${tasks.total} tasks`}
      trend={{
        value: completionRate,
        direction: completionRate >= 90 ? 'up' : completionRate >= 70 ? 'neutral' : 'down',
      }}
      {...props}
    />
  );
};

export const RevenueMetricCard = ({ revenue, currency = 'EUR', ...props }: { revenue: number; currency?: string } & Omit<MetricCardProps, 'title' | 'value'>) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <MetricCard
      title="Total Revenue"
      value={formatCurrency(revenue)}
      description="This month"
      {...props}
    />
  );
};