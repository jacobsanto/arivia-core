
import React from "react";
import { AnalyticsContent } from "@/components/reports/AnalyticsContent";
import MobileAnalyticsDashboard from "@/components/reports/mobile/MobileAnalyticsDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";

const Analytics = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Performance metrics and insights</p>
      </div>
      
      <AnalyticsProvider>
        {isMobile ? (
          <MobileAnalyticsDashboard />
        ) : (
          <AnalyticsContent />
        )}
      </AnalyticsProvider>
    </div>
  );
};

export default Analytics;
