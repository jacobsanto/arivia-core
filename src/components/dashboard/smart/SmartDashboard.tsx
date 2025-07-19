import React from "react";
import { Helmet } from "react-helmet-async";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Target, Building, Zap } from "lucide-react";
import { MVPDashboardHeader } from "../mvp/MVPDashboardHeader";
import { SmartMetricsGrid } from "./SmartMetricsGrid";
import { TrendChart } from "./TrendChart";
import { SmartInsights } from "./SmartInsights";
import { PredictiveAnalytics } from "../predictive/PredictiveAnalytics";
import { RevenueOptimization } from "../predictive/RevenueOptimization";
import { PropertyPerformanceGrid } from "../property/PropertyPerformanceGrid";
import { PropertyRankings } from "../property/PropertyRankings";
import { PropertyComparison } from "../property/PropertyComparison";
import { TaskAutomationIntelligence } from "../automation/TaskAutomationIntelligence";
import { SmartTaskScheduler } from "../automation/SmartTaskScheduler";
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
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Forecasting
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Revenue Optimization
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property Insights
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Task Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="forecasting">
            <PredictiveAnalytics />
          </TabsContent>

          <TabsContent value="optimization">
            <RevenueOptimization />
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <PropertyRankings />
            <PropertyPerformanceGrid />
            <PropertyComparison />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <TaskAutomationIntelligence />
            <SmartTaskScheduler />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};