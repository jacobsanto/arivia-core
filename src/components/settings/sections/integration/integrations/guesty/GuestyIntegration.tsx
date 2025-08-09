import React from "react";
import IntegrationsMarketplace from "@/components/marketplace/IntegrationsMarketplace";

const GuestyIntegration = () => {
  // The legacy Guesty-specific panel has been replaced by the generic Marketplace.
  // This keeps navigation stable but removes all Guesty functionality & monitors.
  return (
    <div className="space-y-4">
      <IntegrationsMarketplace />
    </div>
  );
};

export default GuestyIntegration;
