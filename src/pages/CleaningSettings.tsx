import React from "react";
import { UnifiedCleaningDashboard } from "@/components/cleaning/UnifiedCleaningDashboard";
import { CleaningErrorBoundary } from "@/components/error-boundaries/CleaningErrorBoundary";

const CleaningSettings = () => {
  return (
    <CleaningErrorBoundary>
      <UnifiedCleaningDashboard />
    </CleaningErrorBoundary>
  );
};

export default CleaningSettings;