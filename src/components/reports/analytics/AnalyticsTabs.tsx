
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardOverview } from './DashboardOverview';
import { FinancialReports } from './FinancialReports';
import TaskReporting from "@/components/tasks/TaskReporting";
import { OccupancyAnalysis } from './OccupancyAnalysis';
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

export const AnalyticsTabs: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="dashboards" className="space-y-4">
      {isMobile ? (
        <ScrollArea className="w-full pb-2">
          <TabsList className="w-[500px] mb-4">
            <TabsTrigger value="dashboards" className="flex-1 whitespace-nowrap">Dashboards</TabsTrigger>
            <TabsTrigger value="financial" className="flex-1 whitespace-nowrap">Financial</TabsTrigger>
            <TabsTrigger value="operational" className="flex-1 whitespace-nowrap">Operational</TabsTrigger>
            <TabsTrigger value="occupancy" className="flex-1 whitespace-nowrap">Occupancy</TabsTrigger>
          </TabsList>
        </ScrollArea>
      ) : (
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        </TabsList>
      )}
      
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
