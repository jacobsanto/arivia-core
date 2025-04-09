
import React from "react";
import AnalyticsDashboard from "@/components/reports/AnalyticsDashboard";
import MobileAnalyticsDashboard from "@/components/reports/mobile/MobileAnalyticsDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const Analytics = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Performance metrics and insights</p>
      </div>
      
      {isMobile ? (
        <MobileAnalyticsDashboard />
      ) : (
        <AnalyticsDashboard />
      )}
    </div>
  );
};

export default Analytics;
