
import React from "react";
import HousekeepingDashboardContainer from "@/components/housekeeping/HousekeepingDashboardContainer";
import { HousekeepingErrorBoundary } from "@/components/error-boundaries/HousekeepingErrorBoundary";

const Housekeeping: React.FC = () => {
  return (
    <HousekeepingErrorBoundary>
      <HousekeepingDashboardContainer />
    </HousekeepingErrorBoundary>
  );
};

export default Housekeeping;
