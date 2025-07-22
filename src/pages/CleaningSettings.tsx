import React from "react";
import { CleaningConfigPage } from "@/components/cleaning/CleaningConfigPage";
import { CleaningErrorBoundary } from "@/components/error-boundaries/CleaningErrorBoundary";

const CleaningSettings = () => {
  return (
    <CleaningErrorBoundary>
      <CleaningConfigPage />
    </CleaningErrorBoundary>
  );
};

export default CleaningSettings;