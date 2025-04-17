
import React from 'react';
import { MetricCardContainer } from './MetricCardContainer';
import { createMetricCards } from './createMetricCards';

interface DashboardMetricsProps {
  data: any;
  isLoading?: boolean;
  error?: string | null;
  favoriteMetrics?: string[];
  onToggleFavorite?: (metricId: string) => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  data,
  isLoading = false,
  error = null,
  favoriteMetrics = [],
  onToggleFavorite
}) => {
  // Generate metric cards based on dashboard data
  const metricCards = createMetricCards(data, favoriteMetrics);
  
  return (
    <MetricCardContainer 
      cards={metricCards} 
      isLoading={isLoading}
      error={error}
      onToggleFavorite={onToggleFavorite}
    />
  );
};

// Add default export
export default DashboardMetrics;
