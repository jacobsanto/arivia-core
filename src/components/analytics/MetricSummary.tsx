import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
interface MetricSummaryProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  description?: string;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}
export const MetricSummary: React.FC<MetricSummaryProps> = ({
  title,
  value,
  change,
  icon,
  description,
  variant = 'default',
  size = 'md'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return "border-l-4 border-l-primary bg-primary/5";
      case 'success':
        return "border-l-4 border-l-green-500 bg-green-50";
      case 'warning':
        return "border-l-4 border-l-amber-500 bg-amber-50";
      case 'info':
        return "border-l-4 border-l-blue-500 bg-blue-50";
      default:
        return "";
    }
  };
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return "p-3";
      case 'lg':
        return "p-5";
      default:
        return "p-4";
    }
  };
  return <Card className={cn("overflow-hidden", getVariantStyles())}>
      <CardContent className={cn("flex justify-between items-start", getSizeStyles())}>
        <div>
          <p className="font-medium text-muted-foreground text-xs">{title}</p>
          <div className={cn("font-bold mt-1", size === 'sm' ? "text-lg" : size === 'lg' ? "text-3xl" : "text-2xl")}>
            {value}
          </div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        
        <div className="flex flex-col items-end">
          {icon && <div className="text-muted-foreground mb-1">{icon}</div>}
          
          {change && <div className={cn("flex items-center text-xs font-medium", change.isPositive ? "text-green-500" : "text-red-500")}>
              {change.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {change.value}%
            </div>}
        </div>
      </CardContent>
    </Card>;
};