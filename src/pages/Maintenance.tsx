
import React, { useState } from "react";
import { MaintenanceTaskManagement } from "@/components/maintenance/MaintenanceTaskManagement";
import { MaintenanceErrorBoundary } from "@/components/error-boundaries/MaintenanceErrorBoundary";

const Maintenance: React.FC = () => {
  return (
    <MaintenanceErrorBoundary>
      <MaintenanceTaskManagement />
    </MaintenanceErrorBoundary>
  );
};

export default Maintenance;
