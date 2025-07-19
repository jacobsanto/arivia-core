
import React from "react";
import { Helmet } from "react-helmet-async";
import { useIsMobile } from "@/hooks/use-mobile";
import { MVPDashboardHeader } from "./MVPDashboardHeader";
import { MVPMetricsGrid } from "./MVPMetricsGrid";
import { MVPQuickActions } from "./MVPQuickActions";
import { MVPRecentActivity } from "./MVPRecentActivity";
import { MVPPropertyOverview } from "./MVPPropertyOverview";

export const MVPDashboard: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <Helmet>
        <title>Dashboard - Arivia Villas Management</title>
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <MVPDashboardHeader />
        
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          <div className="lg:col-span-2 space-y-6">
            <MVPMetricsGrid />
            <MVPPropertyOverview />
          </div>
          
          <div className="space-y-6">
            <MVPQuickActions />
            <MVPRecentActivity />
          </div>
        </div>
      </div>
    </>
  );
};
