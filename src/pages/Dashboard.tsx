
import React from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RestrictedAccess from "@/components/layout/RestrictedAccess";
import { useUser } from "@/contexts/auth/UserContext";
import { useDashboard } from "@/hooks/useDashboard";

const Dashboard = () => {
  const { user } = useUser();
  const { 
    selectedProperty, 
    dateRange, 
    dashboardData,
    handlePropertyChange,
    handleDateRangeChange
  } = useDashboard();
  
  // If user is a guest with pending approval, show restricted access view
  if (user?.role === "guest" && user?.pendingApproval) {
    return <RestrictedAccess />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <DashboardHeader 
        selectedProperty={selectedProperty}
        onPropertyChange={handlePropertyChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
      <DashboardContent dashboardData={dashboardData} />
    </div>
  );
};

export default Dashboard;
