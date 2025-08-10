
import React from "react";
import { Helmet } from "react-helmet-async";
import { AdvancedReportingDashboard } from "@/components/reporting/AdvancedReportingDashboard";
import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";

const Analytics: React.FC = () => {
  return (
    <AnalyticsErrorBoundary>
      <>
        <Helmet>
          <title>Operational Analytics – Arivia Villas</title>
          <meta name="description" content="Operational analytics dashboard with performance, occupancy, and task metrics for Arivia Villas." />
          <link rel="canonical" href="/analytics" />
        </Helmet>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Operational Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive insights into your property operations, performance metrics, and efficiency tracking
            </p>
          </div>
          <AdvancedReportingDashboard />
        </div>
      </>
    </AnalyticsErrorBoundary>
  );
};

export default Analytics;
