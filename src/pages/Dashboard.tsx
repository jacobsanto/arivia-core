
import React, { useMemo, Suspense } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileDashboard from "@/components/dashboard/MobileDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

// Loader component for better UX during loading states
const DashboardLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
    </div>
  </div>
);

const Dashboard = () => {
  const {
    selectedProperty,
    dateRange,
    dashboardData,
    handlePropertyChange,
    handleDateRangeChange,
    refreshDashboard,
    isLoading
  } = useDashboard();
  
  const isMobile = useIsMobile();

  // Memoize the dashboard content to prevent re-renders
  const dashboardContent = useMemo(() => {
    if (isLoading || !dashboardData) {
      return <DashboardLoader />;
    }

    return isMobile ? (
      <MobileDashboard dashboardData={dashboardData} />
    ) : (
      <DashboardContent dashboardData={dashboardData} />
    );
  }, [dashboardData, isMobile, isLoading]);

  return (
    <>
      <Helmet>
        <title>Dashboard - Arivia Villas</title>
      </Helmet>
      <div className="space-y-6">
        <DashboardHeader 
          selectedProperty={selectedProperty}
          onPropertyChange={handlePropertyChange}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          refreshDashboardContent={refreshDashboard}
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
