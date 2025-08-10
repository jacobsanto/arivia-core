
import React from "react";
import { MVPTaskManagement } from "@/components/tasks/mvp/MVPTaskManagement";
import { MaintenanceErrorBoundary } from "@/components/error-boundaries/MaintenanceErrorBoundary";

const Maintenance: React.FC = () => {
  return (
    <MaintenanceErrorBoundary>
      <MVPTaskManagement />
    </MaintenanceErrorBoundary>
  );
};

export default Maintenance;
