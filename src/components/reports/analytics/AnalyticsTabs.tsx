
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardOverview } from './DashboardOverview';
import { FinancialReports } from './FinancialReports';
import TaskReporting from "@/components/tasks/TaskReporting";
import { OccupancyAnalysis } from './OccupancyAnalysis';

export const AnalyticsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="dashboards" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
        <TabsTrigger value="operational">Operational</TabsTrigger>
        <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboards" className="space-y-4">
        <DashboardOverview />
      </TabsContent>
      
      <TabsContent value="financial" className="space-y-4">
        <FinancialReports />
      </TabsContent>
      
      <TabsContent value="operational" className="space-y-4">
        <TaskReporting />
      </TabsContent>
      
      <TabsContent value="occupancy" className="space-y-4">
        <OccupancyAnalysis />
      </TabsContent>
    </Tabs>
  );
};
