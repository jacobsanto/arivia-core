
import React from "react";
import { DashboardContent } from "@/components/dashboard/Dashboard";
import { DashboardErrorBoundary } from "@/components/error-boundaries/DashboardErrorBoundary";

const Dashboard: React.FC = () => {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
