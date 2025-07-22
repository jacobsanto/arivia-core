
import React from "react";
import { MVPDashboard } from "@/components/dashboard/mvp/MVPDashboard";
import { DashboardErrorBoundary } from "@/components/error-boundaries/DashboardErrorBoundary";

const Dashboard: React.FC = () => {
  return (
    <DashboardErrorBoundary>
      <MVPDashboard />
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
