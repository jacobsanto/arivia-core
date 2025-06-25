
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MetricCard from "./metrics/MetricCard";
import { MetricCardContainer } from "./metrics/MetricCardContainer";
import { createMetricCards } from "./metrics/createMetricCards";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, RefreshCw, BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  favoriteMetrics?: string[];
  onToggleFavorite?: (metricId: string) => void;
  onRefresh?: () => void;
  onAddSampleData?: () => void;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  data = {}, 
  isLoading = false,
  error = null,
  favoriteMetrics = [],
  onToggleFavorite,
  onRefresh,
  onAddSampleData
}) => {
  const isMobile = useIsMobile();
  
  // Show loading state with proper mobile responsiveness
  if (isLoading) {
    return (
      <LoadingState 
        type="card" 
        count={isMobile ? 2 : 6}
        text="Loading dashboard metrics..."
      />
    );
  }
  
  // Show error state with retry functionality
  if (error) {
    return (
      <Alert variant="destructive">
        <Database className="h-4 w-4" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>Failed to load dashboard metrics: {error}</span>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="self-start sm:self-auto"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Check if we have valid data for any of the metrics
  const hasPropertiesData = data?.properties && 
    typeof data.properties.total === 'number' &&
    typeof data.properties.occupied === 'number' &&
    typeof data.properties.vacant === 'number';
    
  const hasTasksData = data?.tasks && 
    typeof data.tasks.total === 'number' &&
    typeof data.tasks.completed === 'number' &&
    typeof data.tasks.pending === 'number';
    
  const hasMaintenanceData = data?.maintenance && 
    typeof data.maintenance.total === 'number' &&
    typeof data.maintenance.critical === 'number' &&
    typeof data.maintenance.standard === 'number';
  
  const hasData = hasPropertiesData || hasTasksData || hasMaintenanceData;
  
  // Create metric cards if we have data
  const metricCards = hasData ? createMetricCards(data, favoriteMetrics || []) : [];
  
  // Show empty state with helpful actions
  if (!hasData || metricCards.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No Dashboard Data Available"
        description="Start by adding properties, tasks, or maintenance records to see your metrics here. You can also populate sample data to explore the dashboard."
        action={onAddSampleData ? {
          label: "Add Sample Data",
          onClick: onAddSampleData,
          variant: "default"
        } : undefined}
        className="mx-auto max-w-md"
      />
    );
  }
  
  return (
    <MetricCardContainer
      cards={metricCards}
      onToggleFavorite={onToggleFavorite}
    />
  );
};

export default DashboardMetrics;
