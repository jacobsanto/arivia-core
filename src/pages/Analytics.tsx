import React from "react";
import { AdvancedReportingDashboard } from "@/components/reporting/AdvancedReportingDashboard";

const Analytics: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Operational Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into your property operations, performance metrics, and efficiency tracking
        </p>
      </div>
      <AdvancedReportingDashboard />
    </div>
  );
};

export default Analytics;