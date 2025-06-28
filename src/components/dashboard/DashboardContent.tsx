
import React from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CleaningRulesManager from "./CleaningRulesManager";
import QuickActionsSection from "./sections/QuickActionsSection";
import DashboardOverviewSection from "./sections/DashboardOverviewSection";

interface DashboardContentProps {
  dashboardData?: any;
  isLoading?: boolean;
  error?: string | null;
  favoriteMetrics?: string[];
  onToggleFavorite?: (metricId: string) => void;
  onRefresh?: () => Promise<any>;
  onAddSampleData?: () => Promise<void>;
  onBookingSync?: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboardData,
  isLoading,
  error,
  favoriteMetrics,
  onToggleFavorite,
  onRefresh,
  onAddSampleData,
  onBookingSync
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState 
          type="card" 
          count={6}
          text="Loading dashboard data..."
        />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>Failed to load dashboard: {error}</span>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview Section */}
      <DashboardOverviewSection
        dashboardData={dashboardData}
        isLoading={isLoading}
        error={error}
        favoriteMetrics={favoriteMetrics}
        onToggleFavorite={onToggleFavorite}
        onRefresh={onRefresh}
        onAddSampleData={onAddSampleData}
      />

      {/* Quick Actions Section */}
      <section>
        <QuickActionsSection onBookingSync={onBookingSync} />
      </section>
      
      {/* Cleaning Rules Manager Section */}
      <section>
        <CleaningRulesManager />
      </section>
    </div>
  );
};

export default DashboardContent;
