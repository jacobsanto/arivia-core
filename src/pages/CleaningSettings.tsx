
import React from "react";
import { RuleBasedDashboard } from "@/components/cleaning/RuleBasedDashboard";
import { CleaningErrorBoundary } from "@/components/error-boundaries/CleaningErrorBoundary";

const CleaningSettings = () => {
  return (
    <CleaningErrorBoundary>
      <RuleBasedDashboard />
    </CleaningErrorBoundary>
  );
};

export default CleaningSettings;
