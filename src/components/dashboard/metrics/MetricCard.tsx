
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwipeableCard } from "@/components/ui/swipeable-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  footer?: React.ReactNode;
  swipeable?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning';
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  footer, 
  swipeable = false,
  trend,
  icon,
  variant = 'default'
}) => {
  const isMobile = useIsMobile();
  
  const getCardStyle = () => {
    switch(variant) {
      case 'accent':
        return "border-l-4 border-l-primary";
      case 'success':
        return "border-l-4 border-l-green-500";
      case 'warning':
        return "border-l-4 border-l-amber-500";
      default:
        return "";
    }
  };
  
  const cardContent = (
    <>
      <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'p-3 pb-1' : 'pb-2'}`}>
        <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium flex items-center gap-2`}>
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
        <div className="flex items-center justify-between mb-1">
          <div className={`${isMobile ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} font-bold tracking-tight`}>{value}</div>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {trend.value}%
            </div>
          )}
        </div>
        <p className={`${isMobile ? 'text-2xs' : 'text-xs'} text-muted-foreground`}>{description}</p>
        {footer && <div className={`${isMobile ? 'mt-1' : 'mt-2'}`}>{footer}</div>}
      </CardContent>
    </>
  );
  
  if (swipeable && isMobile) {
    return (
      <SwipeableCard 
        className={`h-full ${getCardStyle()}`}
        swipeEnabled={true}
        swipeIndicators={false}
      >
        {cardContent}
      </SwipeableCard>
    );
  }
  
  return <Card className={`h-full ${getCardStyle()}`}>{cardContent}</Card>;
};
