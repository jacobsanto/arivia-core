
import React, { useMemo, Suspense, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileDashboard from "@/components/dashboard/MobileDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboardPreferences } from "@/hooks/useDashboardPreferences";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertTriangle, Save } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DateRange } from "@/components/reports/DateRangeSelector";

// Loader component for better UX during loading states
const DashboardLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
    </div>
  </div>
);

// Error fallback component for error states
const DashboardErrorFallback: React.FC<{
  error: string;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-64 px-4">
    <Alert variant="destructive" className="max-w-md w-full mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error loading dashboard</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
    <Button onClick={onRetry} variant="outline">
      <Loader2 className="mr-2 h-4 w-4" />
      Retry
    </Button>
  </div>
);

const Dashboard: React.FC = () => {
  const {
    dashboardData,
    handlePropertyChange,
    handleDateRangeChange,
    refreshDashboard,
    isLoading,
    error
  } = useDashboard();
  
  // Use the new preferences hook
  const { 
    preferences,
    isSaving,
    lastSaved,
    updateSelectedProperty,
    updateDateRange,
    toggleFavoriteMetric
  } = useDashboardPreferences();
  
  const isMobile = useIsMobile();

  // Optimize refresh callback with useCallback
  const handleRefresh = useCallback(() => {
    return refreshDashboard();
  }, [refreshDashboard]);

  // Convert stored preferences date range for dashboard
  const convertedDateRange: DateRange = useMemo(() => {
    return {
      from: preferences.dateRange.from ? new Date(preferences.dateRange.from) : undefined,
      to: preferences.dateRange.to ? new Date(preferences.dateRange.to) : undefined
    };
  }, [preferences.dateRange]);

  // Handle property change with preference saving
  const handlePropertyChangeWithSave = useCallback((property: string) => {
    updateSelectedProperty(property);
    handlePropertyChange(property);
  }, [updateSelectedProperty, handlePropertyChange]);

  // Handle date range change with preference saving
  const handleDateRangeChangeWithSave = useCallback((range: DateRange) => {
    updateDateRange(range);
    handleDateRangeChange(range);
  }, [updateDateRange, handleDateRangeChange]);

  // Memoize the dashboard content to prevent re-renders
  const dashboardContent = useMemo(() => {
    if (error) {
      return (
        <DashboardErrorFallback 
          error={error} 
          onRetry={handleRefresh} 
        />
      );
    }
    
    if (isLoading || !dashboardData) {
      return <DashboardLoader />;
    }

    return isMobile ? (
      <MobileDashboard 
        dashboardData={dashboardData} 
        onRefresh={handleRefresh}
        isLoading={isLoading}
        error={error} 
      />
    ) : (
      <DashboardContent 
        dashboardData={dashboardData} 
        isLoading={isLoading}
        error={error}
        favoriteMetrics={preferences.favoriteMetrics}
        onToggleFavorite={toggleFavoriteMetric}
      />
    );
  }, [dashboardData, isMobile, isLoading, error, handleRefresh, preferences.favoriteMetrics, toggleFavoriteMetric]);

  return (
    <>
      <Helmet>
        <title>Dashboard - Arivia Villas</title>
      </Helmet>
      <div className="space-y-6 pb-8">
        {isSaving && (
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <Save className="h-3 w-3 mr-1 animate-pulse" />
            <span>Saving preferences...</span>
          </div>
        )}
        
        {lastSaved && !isSaving && (
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <span>Preferences saved at {lastSaved.toLocaleTimeString()}</span>
          </div>
        )}
        
        <DashboardHeader 
          selectedProperty={preferences.selectedProperty}
          onPropertyChange={handlePropertyChangeWithSave}
          dateRange={convertedDateRange}
          onDateRangeChange={handleDateRangeChangeWithSave}
          refreshDashboardContent={handleRefresh}
          dashboardData={dashboardData}
          isLoading={isLoading}
        />
        
        <Suspense fallback={<DashboardLoader />}>
          {dashboardContent}
        </Suspense>
      </div>
    </>
  );
};

export default Dashboard;
