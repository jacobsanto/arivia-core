
import React, { useMemo, Suspense } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileDashboard from "@/components/dashboard/MobileDashboard";
import { DateRange } from "@/components/reports/DateRangeSelector";
import DashboardLoadingStates from "./DashboardLoadingStates";
import DashboardSavingIndicator from "./DashboardSavingIndicator";

interface DashboardContainerProps {
  selectedProperty: string;
  onPropertyChange: (property: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  refreshDashboard: () => Promise<any>;
  dashboardData: any;
  isLoading: boolean;
  error: string | null;
  isMobile: boolean;
  preferences: any;
  isSaving: boolean;
  lastSaved: Date | null;
  onToggleFavorite: (metricId: string) => void;
  onAddSampleData: () => Promise<void>;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  selectedProperty,
  onPropertyChange,
  dateRange,
  onDateRangeChange,
  refreshDashboard,
  dashboardData,
  isLoading,
  error,
  isMobile,
  preferences,
  isSaving,
  lastSaved,
  onToggleFavorite,
  onAddSampleData
}) => {
  const dashboardHeader = useMemo(() => (
    <DashboardHeader 
      selectedProperty={selectedProperty}
      onPropertyChange={onPropertyChange}
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
      refreshDashboardContent={refreshDashboard}
      dashboardData={dashboardData}
      isLoading={isLoading}
    />
  ), [
    selectedProperty, 
    onPropertyChange, 
    dateRange, 
    onDateRangeChange, 
    refreshDashboard,
    dashboardData,
    isLoading
  ]);

  const dashboardContent = useMemo(() => {
    if (error) {
      return (
        <DashboardLoadingStates.ErrorFallback 
          error={error} 
          onRetry={refreshDashboard} 
        />
      );
    }
    
    if (isLoading) {
      return <DashboardLoadingStates.Loader />;
    }

    return isMobile ? (
      <MobileDashboard 
        dashboardData={dashboardData} 
        onRefresh={refreshDashboard}
        isLoading={isLoading}
        error={error} 
      />
    ) : (
      <DashboardContent 
        dashboardData={dashboardData} 
        isLoading={isLoading}
        error={error}
        favoriteMetrics={preferences.favoriteMetrics}
        onToggleFavorite={onToggleFavorite}
        onRefresh={refreshDashboard}
        onAddSampleData={onAddSampleData}
      />
    );
  }, [
    dashboardData, 
    isMobile, 
    isLoading, 
    error, 
    refreshDashboard, 
    preferences.favoriteMetrics, 
    onToggleFavorite,
    onAddSampleData
  ]);

  return (
    <div className="space-y-6 pb-8">
      <DashboardSavingIndicator isSaving={isSaving} lastSaved={lastSaved} />
      
      {dashboardHeader}
      
      <Suspense fallback={<DashboardLoadingStates.Loader />}>
        {dashboardContent}
      </Suspense>
    </div>
  );
};

export default DashboardContainer;
