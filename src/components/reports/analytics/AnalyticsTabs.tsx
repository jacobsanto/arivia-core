
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardOverview } from './DashboardOverview';
import { FinancialReports } from './FinancialReports';
import TaskReporting from "@/components/tasks/TaskReporting";
import { OccupancyAnalysis } from './OccupancyAnalysis';
import { useIsMobile } from "@/hooks/use-mobile";

export const AnalyticsTabs: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="dashboards" className="space-y-4">
      <div className="mobile-scroll">
        <TabsList className={`${isMobile ? 'w-[500px] min-w-full' : 'w-full'} grid grid-cols-4 mb-4`}>
          <TabsTrigger value="dashboards" className="truncate">Dashboards</TabsTrigger>
          <TabsTrigger value="financial" className="truncate">Financial</TabsTrigger>
          <TabsTrigger value="operational" className="truncate">Operational</TabsTrigger>
          <TabsTrigger value="occupancy" className="truncate">Occupancy</TabsTrigger>
        </TabsList>
      </div>
      
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
