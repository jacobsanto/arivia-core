
import React from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";

const Home = () => {
  // Providing an empty dashboardData object to satisfy the props requirement
  const dashboardData = {
    tasks: [],
    properties: [],
    metrics: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueCount: 0
    }
  };

  return <DashboardContent dashboardData={dashboardData} />;
};

export default Home;
