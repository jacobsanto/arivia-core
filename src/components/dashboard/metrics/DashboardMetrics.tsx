
import React from 'react';
import { MetricCardContainer } from './MetricCardContainer';
import { createMetricCards } from './createMetricCards';
import { Skeleton } from '@/components/ui/skeleton';

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
  
  if (!metricCards || metricCards.length === 0 && !isLoading && !error) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
        <p className="text-blue-800">No metrics data available</p>
      </div>
    );
  }
  
  return (
    <MetricCardContainer 
      cards={metricCards} 
      isLoading={isLoading}
      error={error ? String(error) : null}
      onToggleFavorite={onToggleFavorite}
    />
  );
};

// Add default export
export default DashboardMetrics;
