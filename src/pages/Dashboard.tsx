
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileDashboard from "@/components/dashboard/MobileDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

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
    return <div className="flex items-center justify-center h-64">Loading dashboard data...</div>;
  }

  return (
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
  );
};

export default Dashboard;
