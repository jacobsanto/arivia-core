
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MetricCard from "./metrics/MetricCard";
import { MetricCardContainer } from "./metrics/MetricCardContainer";
import { createMetricCards } from "./metrics/createMetricCards";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, RefreshCw } from "lucide-react";
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
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  data = {}, 
  isLoading = false,
  error = null,
  favoriteMetrics = [],
  onToggleFavorite
}) => {
  const isMobile = useIsMobile();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard metrics: {error}
          </AlertDescription>
        </Alert>
      </div>
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
  
  // Show empty state with helpful message
  if (!hasData || metricCards.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <div>
              No dashboard data available. This could be because:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>No properties have been added to the system</li>
                <li>No tasks or maintenance records exist</li>
                <li>The selected date range contains no data</li>
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">
              Try adding some properties, tasks, or adjusting your date range to see metrics.
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <MetricCardContainer
      cards={metricCards}
    />
  );
};

export default DashboardMetrics;
