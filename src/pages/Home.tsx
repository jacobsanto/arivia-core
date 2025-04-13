
import React from "react";
import { useDashboard } from "@/hooks/useDashboard";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { Helmet } from "react-helmet-async";

const Home = () => {
  const { dashboardData, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Safety check to ensure dashboardData exists
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">No dashboard data available.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Arivia Villas</title>
      </Helmet>
      <div className="space-y-6">
        <DashboardContent dashboardData={dashboardData} />
      </div>
    </>
  );
};

export default Home;
