
import React from "react";
import { AdvancedReportingDashboard } from "@/components/reporting/AdvancedReportingDashboard";
import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";
import { Helmet } from "react-helmet-async";

const Analytics: React.FC = () => {
  const pageTitle = "Operational Analytics | Arivia Villas";
  const description = "Real-time analytics for properties, operations, and performance metrics.";
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}/analytics` : '/analytics';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Arivia Villas Operational Analytics",
    "url": canonical,
    "applicationCategory": "BusinessApplication",
    "description": description
  };

  return (
    <AnalyticsErrorBoundary>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
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
    </AnalyticsErrorBoundary>
  );
};

export default Analytics;