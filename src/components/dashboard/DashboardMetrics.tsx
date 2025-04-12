
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwipeableCard } from "@/components/ui/swipeable-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { SwipeIndicator } from "@/components/ui/swipe-indicator";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  footer?: React.ReactNode;
  swipeable?: boolean;
}

export const MetricCard = ({ title, value, description, footer, swipeable = false }: MetricCardProps) => {
  const isMobile = useIsMobile();
  
  const cardContent = (
    <>
      <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'p-3 pb-1' : 'pb-2'}`}>
        <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
        <div className={`${isMobile ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} font-bold tracking-tight`}>{value}</div>
        <p className={`${isMobile ? 'text-2xs' : 'text-xs'} text-muted-foreground`}>{description}</p>
        {footer && <div className={`${isMobile ? 'mt-1' : 'mt-2'}`}>{footer}</div>}
      </CardContent>
    </>
  );
  
  if (swipeable && isMobile) {
    return (
      <SwipeableCard 
        className="h-full" 
        swipeEnabled={true}
        swipeIndicators={false}
      >
        {cardContent}
      </SwipeableCard>
    );
  }
  
  return <Card className="h-full">{cardContent}</Card>;
};

interface DashboardMetricsProps {
  data: {
    properties: {
      total: number;
      occupied: number;
      vacant: number;
    };
    tasks: {
      total: number;
      completed: number;
      pending: number;
    };
    maintenance: {
      total: number;
      critical: number;
      standard: number;
    };
  };
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ data }) => {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = isMobile ? 2 : 3;
  
  // Prepare all metrics cards
  const allCards = [
    {
      title: "Properties",
      value: data.properties.total.toString(),
      description: "Properties Managed",
      footer: isMobile ? (
        <div className="text-2xs text-muted-foreground">
          <span className="text-green-500">{data.properties.occupied}</span> Occ | 
          <span className="text-blue-500"> {data.properties.vacant}</span> Vac
        </div>
      ) : (
        <div className="text-xs text-muted-foreground font-condensed">
          <span className="text-green-500 font-medium">{data.properties.occupied}</span> Occupied | 
          <span className="text-blue-500 font-medium"> {data.properties.vacant}</span> Vacant
        </div>
      )
    },
    {
      title: "Tasks",
      value: data.tasks.total.toString(),
      description: "Active Tasks",
      footer: isMobile ? (
        <div className="text-2xs text-muted-foreground">
          <span className="text-green-500">{data.tasks.completed}</span> Done | 
          <span className="text-amber-500"> {data.tasks.pending}</span> Pend
        </div>
      ) : (
        <div className="text-xs text-muted-foreground font-condensed">
          <span className="text-green-500 font-medium">{data.tasks.completed}</span> Completed | 
          <span className="text-amber-500 font-medium"> {data.tasks.pending}</span> Pending
        </div>
      )
    },
    {
      title: "Maintenance",
      value: data.maintenance.total.toString(),
      description: "Maintenance Issues",
      footer: isMobile ? (
        <div className="text-2xs text-muted-foreground">
          <span className="text-red-500">{data.maintenance.critical}</span> Crit | 
          <span className="text-blue-500"> {data.maintenance.standard}</span> Std
        </div>
      ) : (
        <div className="text-xs text-muted-foreground font-condensed">
          <span className="text-red-500 font-medium">{data.maintenance.critical}</span> Critical | 
          <span className="text-blue-500 font-medium"> {data.maintenance.standard}</span> Standard
        </div>
      )
    }
  ];
  
  // Pagination for mobile view
  const visibleCards = isMobile 
    ? allCards.slice(currentPage * cardsPerPage, (currentPage * cardsPerPage) + cardsPerPage)
    : allCards;
    
  const totalPages = Math.ceil(allCards.length / cardsPerPage);
  
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'right' && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  return (
    <div className="relative">
      <div className={`grid gap-3 md:gap-6 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {visibleCards.map((card, index) => (
          <MetricCard
            key={`metric-${index}`}
            title={card.title}
            value={card.value}
            description={card.description}
            footer={card.footer}
            swipeable={isMobile}
          />
        ))}
      </div>
      
      {isMobile && totalPages > 1 && (
        <div className="flex justify-center mt-2 gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div 
              key={`indicator-${i}`} 
              className={`h-1.5 rounded-full transition-all ${currentPage === i ? 'w-4 bg-primary' : 'w-1.5 bg-muted'}`}
            />
          ))}
        </div>
      )}
      
      {isMobile && (
        <>
          {currentPage > 0 && (
            <SwipeIndicator 
              direction="right" 
              visible={true}
              className="top-1/2 -translate-y-1/2 left-1"
            />
          )}
          {currentPage < totalPages - 1 && (
            <SwipeIndicator 
              direction="left" 
              visible={true}
              className="top-1/2 -translate-y-1/2 right-1" 
            />
          )}
        </>
      )}
    </div>
  );
};

export default DashboardMetrics;
