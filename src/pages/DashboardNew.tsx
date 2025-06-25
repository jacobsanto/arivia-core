
import React, { Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Save } from "lucide-react";
import { DashboardDataProvider, useDashboardContext } from "@/components/dashboard/DashboardDataProvider";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileDashboard from "@/components/dashboard/MobileDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { populateSampleData } from "@/utils/sampleDataPopulator";
import { toast } from "sonner";

// Loader component for better UX during loading states
const DashboardLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
    </div>
  </div>
);

// Saving status indicator component
const SavingIndicator = ({ isSaving, lastSaved }: { 
  isSaving: boolean;
  lastSaved: Date | null;
}) => {
  if (isSaving) {
    return (
      <div className="flex items-center justify-end text-xs text-muted-foreground">
        <Save className="h-3 w-3 mr-1 animate-pulse" />
        <span>Saving preferences...</span>
      </div>
    );
  }
  
  if (lastSaved) {
    return (
      <div className="flex items-center justify-end text-xs text-muted-foreground">
        <span>Preferences saved at {lastSaved.toLocaleTimeString()}</span>
      </div>
    );
  }
  
  return null;
};

const DashboardInner: React.FC = () => {
  const {
    dashboardData,
    isLoading,
    error,
    preferences,
    isSaving,
    lastSaved,
    selectedProperty,
    dateRange,
    handlePropertyChange,
    handleDateRangeChange,
    handleRefresh,
    toggleFavoriteMetric
  } = useDashboardContext();
  
  const isMobile = useIsMobile();

  const handleAddSampleData = async () => {
    try {
      const result = await populateSampleData();
      if (result.success) {
        toast.success("Sample data added successfully", {
          description: "Dashboard will refresh automatically"
        });
        await handleRefresh();
      } else {
        toast.error("Failed to add sample data", {
          description: result.message
        });
      }
    } catch (error) {
      toast.error("Failed to add sample data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const dashboardContent = () => {
    if (isMobile) {
      return (
        <MobileDashboard 
          dashboardData={dashboardData} 
          onRefresh={handleRefresh}
          isLoading={isLoading}
          error={error} 
        />
      );
    }

    return (
      <DashboardContent 
        dashboardData={dashboardData} 
        isLoading={isLoading}
        error={error}
        favoriteMetrics={preferences.favoriteMetrics}
        onToggleFavorite={toggleFavoriteMetric}
        onRefresh={handleRefresh}
        onAddSampleData={handleAddSampleData}
      />
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <SavingIndicator isSaving={isSaving} lastSaved={lastSaved} />
      
      <DashboardHeader 
        selectedProperty={selectedProperty}
        onPropertyChange={handlePropertyChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        refreshDashboardContent={handleRefresh}
        dashboardData={dashboardData}
        isLoading={isLoading}
      />
      
      <ErrorBoundary onReset={handleRefresh}>
        <Suspense fallback={<DashboardLoader />}>
          {dashboardContent()}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard - Arivia Villas</title>
      </Helmet>
      <DashboardDataProvider>
        <DashboardInner />
      </DashboardDataProvider>
    </>
  );
};

export default Dashboard;
