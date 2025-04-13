
import React from "react";
import { useDashboard } from "@/hooks/useDashboard";
import DashboardContent from "@/components/dashboard/DashboardContent";

const Home = () => {
  const { dashboardData, isLoading } = useDashboard();

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return <DashboardContent dashboardData={dashboardData} />;
};

export default Home;
