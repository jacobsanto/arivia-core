
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MetricCard } from "./MetricCard";
import { MetricCardContainer } from "./MetricCardContainer";
import { createMetricCards } from "./createMetricCards";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardMetricsProps {
  data?: {
    properties?: {
      total: number;
      occupied: number;
      vacant: number;
    };
    tasks?: {
      total: number;
      completed: number;
      pending: number;
    };
    maintenance?: {
      total: number;
      critical: number;
      standard: number;
    };
  };
  isLoading?: boolean;
  error?: string | null;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  data = {}, 
  isLoading = false,
  error = null
}) => {
  const isMobile = useIsMobile();
  
  // If there's an error or still loading, show appropriate UI
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-full p-4 bg-red-50 border border-red-200 rounded-md text-center">
          <p className="text-red-800">Failed to load dashboard metrics</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }
  
  // Only create metric cards if we have data
  const hasData = Boolean(
    data.properties || data.tasks || data.maintenance
  );
  
  const metricCards = hasData ? createMetricCards(data, isMobile) : [];
  
  if (!hasData || metricCards.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="col-span-full p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
          <p className="text-blue-800">No metrics data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <MetricCardContainer
      cards={metricCards}
      renderCard={(card, index) => (
        <MetricCard
          key={`metric-${index}`}
          title={card.title}
          value={card.value}
          description={card.description}
          footer={card.footer}
          swipeable={isMobile}
          trend={card.trend}
          variant={card.variant}
          icon={card.icon}
        />
      )}
    />
  );
};

export default DashboardMetrics;
