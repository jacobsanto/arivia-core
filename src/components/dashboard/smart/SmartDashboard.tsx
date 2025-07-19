import React from "react";
import { Helmet } from "react-helmet-async";
import { useIsMobile } from "@/hooks/use-mobile";
import { MVPDashboardHeader } from "../mvp/MVPDashboardHeader";
import { SmartMetricsGrid } from "./SmartMetricsGrid";
import { TrendChart } from "./TrendChart";
import { SmartInsights } from "./SmartInsights";
import { MVPQuickActions } from "../mvp/MVPQuickActions";
import { MVPRecentActivity } from "../mvp/MVPRecentActivity";

export const SmartDashboard: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <Helmet>
        <title>Smart Dashboard - Arivia Villas Management</title>
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <MVPDashboardHeader />
        
        {/* Smart Metrics Grid */}
        <SmartMetricsGrid />
        
        {/* Trend Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <TrendChart
            title="Booking Trends"
            dataKey="bookings"
            type="area"
            color="#3b82f6"
            days={30}
          />
          <TrendChart
            title="Revenue Analytics"
            dataKey="revenue"
            type="area"
            color="#10b981"
            days={30}
          />
          <TrendChart
            title="Task Activity"
            dataKey="tasks"
            type="line"
            color="#f59e0b"
            days={30}
          />
        </div>
        
        {/* Smart Insights */}
        <SmartInsights />
        
        {/* Bottom Grid - Actions and Activity */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          <div className="lg:col-span-1">
            <MVPQuickActions />
          </div>
          <div className="lg:col-span-2">
            <MVPRecentActivity />
          </div>
        </div>
      </div>
    </>
  );
};