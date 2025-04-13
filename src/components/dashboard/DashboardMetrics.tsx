
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MetricCard } from "./metrics/MetricCard";
import { MetricCardContainer } from "./metrics/MetricCardContainer";
import { createMetricCards } from "./metrics/createMetricCards";

interface DashboardMetricsProps {
  data: {
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
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ data }) => {
  const isMobile = useIsMobile();
  
  // Ensure data has all required properties before processing
  const completeData = {
    properties: data.properties || { total: 0, occupied: 0, vacant: 0 },
    tasks: data.tasks || { total: 0, completed: 0, pending: 0 },
    maintenance: data.maintenance || { total: 0, critical: 0, standard: 0 }
  };
  
  const metricCards = createMetricCards(completeData, isMobile);
  
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
        />
      )}
    />
  );
};

export default DashboardMetrics;
