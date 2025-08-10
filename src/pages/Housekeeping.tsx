
import React from "react";
import { MVPTaskManagement } from "@/components/tasks/mvp/MVPTaskManagement";
import { HousekeepingErrorBoundary } from "@/components/error-boundaries/HousekeepingErrorBoundary";

const Housekeeping: React.FC = () => {
  return (
    <HousekeepingErrorBoundary>
      <MVPTaskManagement />
    </HousekeepingErrorBoundary>
  );
};

export default Housekeeping;
