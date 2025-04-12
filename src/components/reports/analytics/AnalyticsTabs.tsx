
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardOverview } from './DashboardOverview';
import { FinancialReports } from './FinancialReports';
import { OccupancyAnalysis } from './OccupancyAnalysis';
import { Activity, BarChart3, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MonitoringDashboard } from '@/components/analytics/MonitoringDashboard';

export const AnalyticsTabs = () => {
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl mx-auto mb-2">
        <TabsTrigger value="overview" className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
          <span className="sm:hidden">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="financial" className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Financial</span>
          <span className="sm:hidden">Financial</span>
        </TabsTrigger>
        <TabsTrigger value="occupancy" className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Occupancy</span>
          <span className="sm:hidden">Occupancy</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-1.5">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Activity</span>
          <span className="sm:hidden">Activity</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6 mt-0">
        <DashboardOverview />
      </TabsContent>
      
      <TabsContent value="financial" className="space-y-6 mt-0">
        <FinancialReports />
      </TabsContent>
      
      <TabsContent value="occupancy" className="space-y-6 mt-0">
        <OccupancyAnalysis />
      </TabsContent>
      
      <TabsContent value="activity" className="space-y-6 mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Activity Monitoring</CardTitle>
            <CardDescription>System, user and operational activities for all villas</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <MonitoringDashboard />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
