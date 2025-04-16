
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwipeableCard } from "@/components/ui/swipeable-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown } from "lucide-react";

export interface MetricCardFooterData {
  text: string;
  [key: string]: any; // Allow for additional data properties
}

export interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  footer?: MetricCardFooterData;
  swipeable?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
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

  // Render the footer content based on the data structure
  const renderFooter = () => {
    if (!footer) return null;

    if (isMobile) {
      return (
        <div className="text-2xs text-muted-foreground">
          {footer.occupied !== undefined && footer.vacant !== undefined && (
            <>
              <span className="text-green-500">{footer.occupied}</span> Occ | 
              <span className="text-blue-500"> {footer.vacant}</span> Vac
            </>
          )}
          {footer.completed !== undefined && footer.pending !== undefined && (
            <>
              <span className="text-green-500">{footer.completed}</span> Done | 
              <span className="text-amber-500"> {footer.pending}</span> Pend
            </>
          )}
          {footer.critical !== undefined && footer.standard !== undefined && (
            <>
              <span className="text-red-500">{footer.critical}</span> Crit | 
              <span className="text-blue-500"> {footer.standard}</span> Std
            </>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-xs text-muted-foreground font-condensed">
          {footer.occupied !== undefined && footer.vacant !== undefined && (
            <>
              <span className="text-green-500 font-medium">{footer.occupied}</span> Occupied | 
              <span className="text-blue-500 font-medium"> {footer.vacant}</span> Vacant
            </>
          )}
          {footer.completed !== undefined && footer.pending !== undefined && (
            <>
              <span className="text-green-500 font-medium">{footer.completed}</span> Completed | 
              <span className="text-amber-500 font-medium"> {footer.pending}</span> Pending
            </>
          )}
          {footer.critical !== undefined && footer.standard !== undefined && (
            <>
              <span className="text-red-500 font-medium">{footer.critical}</span> Critical | 
              <span className="text-blue-500 font-medium"> {footer.standard}</span> Standard
            </>
          )}
        </div>
      );
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
        {footer && <div className={`${isMobile ? 'mt-1' : 'mt-2'}`}>{renderFooter()}</div>}
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

export default MetricCard;
