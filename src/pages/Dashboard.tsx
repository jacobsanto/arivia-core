
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useDashboard } from "@/hooks/useDashboard";

const Dashboard = () => {
  const {
    selectedProperty,
    date,
    dashboardData,
    handlePropertyChange,
    handleDateChange
  } = useDashboard();

  // If data is not yet loaded, show loading state
  if (!dashboardData) {
    return <div className="flex items-center justify-center h-64">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        selectedProperty={selectedProperty}
        onPropertyChange={handlePropertyChange}
        date={date}
        onDateChange={handleDateChange}
      />
      
      <DashboardContent dashboardData={dashboardData} />
    </div>
  );
};

export default Dashboard;
