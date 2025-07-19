import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendData {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
  period: string;
}

interface SmartMetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: TrendData;
  status?: 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export const SmartMetricsCard: React.FC<SmartMetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  status = 'info',
  subtitle,
  isLoading,
  onClick
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50/50';
      case 'warning':
        return 'border-orange-200 bg-orange-50/50';
      case 'error':
        return 'border-red-200 bg-red-50/50';
      default:
        return 'border-blue-200 bg-blue-50/50';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]",
        getStatusColor(),
        onClick && "hover:bg-opacity-80"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className={cn("p-2 rounded-lg", getIconColor())}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {trend && (
              <div className="flex items-center gap-2 mt-3">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", getTrendColor())}
                >
                  <div className="flex items-center gap-1">
                    {getTrendIcon()}
                    {Math.abs(trend.percentage)}%
                  </div>
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {trend.period}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};