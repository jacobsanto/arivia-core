
import React from "react";
import { Helmet } from "react-helmet-async";
import MaintenanceDashboardContainer from "@/components/maintenance/MaintenanceDashboardContainer";
import { MaintenanceErrorBoundary } from "@/components/error-boundaries/MaintenanceErrorBoundary";

const Maintenance: React.FC = () => {
  return (
    <MaintenanceErrorBoundary>
      <Helmet>
        <title>Maintenance Tasks Dashboard | Arivia Villas</title>
        <meta name="description" content="Manage property maintenance tasks, track progress, and view reports." />
        <link rel="canonical" href="/maintenance" />
      </Helmet>
      <MaintenanceDashboardContainer />
    </MaintenanceErrorBoundary>
  );
};

export default Maintenance;
