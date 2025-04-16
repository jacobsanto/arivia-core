import React, { useMemo, Suspense, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileDashboard from "@/components/dashboard/MobileDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
    selectedProperty,
    dateRange,
    dashboardData,
    handlePropertyChange,
    handleDateRangeChange,
    refreshDashboard,
    isLoading,
    error
  } = useDashboard();
  
  const isMobile = useIsMobile();

  // Optimize refresh callback with useCallback
  const handleRefresh = useCallback(() => {
    return refreshDashboard();
  }, [refreshDashboard]);

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
      />
    );
  }, [dashboardData, isMobile, isLoading, error, handleRefresh]);

  return (
    <>
      <Helmet>
        <title>Dashboard - Arivia Villas</title>
      </Helmet>
      <div className="space-y-6 pb-8">
        <DashboardHeader 
          selectedProperty={selectedProperty}
          onPropertyChange={handlePropertyChange}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
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
