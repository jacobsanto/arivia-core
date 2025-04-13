
import React from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { getDashboardData } from "@/utils/dashboardDataUtils";

const Home = () => {
  // Provide a complete dashboard data object with all required properties
  const dashboardData = getDashboardData("all");

  return <DashboardContent dashboardData={dashboardData} />;
};

export default Home;
