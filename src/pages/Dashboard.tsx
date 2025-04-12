
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileDashboard from "@/components/dashboard/MobileDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet-async";

const Dashboard = () => {
  const {
    selectedProperty,
    dateRange,
    dashboardData,
    handlePropertyChange,
    handleDateRangeChange
  } = useDashboard();
  const isMobile = useIsMobile();

  // If data is not yet loaded, show loading state
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

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
        />
        
        {isMobile ? (
          <MobileDashboard dashboardData={dashboardData} />
        ) : (
          <DashboardContent dashboardData={dashboardData} />
        )}
      </div>
    </>
  );
};

export default Dashboard;
