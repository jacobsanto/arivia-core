
import React, { useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, SwipeableTabsProvider } from "@/components/ui/tabs";
import { DashboardOverview } from './DashboardOverview';
import { FinancialReports } from './FinancialReports';
import TaskReporting from "@/components/tasks/TaskReporting";
import { OccupancyAnalysis } from './OccupancyAnalysis';
import { useIsMobile } from "@/hooks/use-mobile";

export const AnalyticsTabs: React.FC = () => {
  const isMobile = useIsMobile();
  const tabsRef = useRef(null);
  
  return (
    <SwipeableTabsProvider>
      <Tabs ref={tabsRef} defaultValue="dashboards" className="space-y-4">
        <TabsList className="w-full scroll-tabs mb-4">
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        </TabsList>
        
        <TabsContent 
          value="dashboards" 
          className="space-y-4"
          tabsRoot={tabsRef}
        >
          <DashboardOverview />
        </TabsContent>
        
        <TabsContent 
          value="financial" 
          className="space-y-4"
          tabsRoot={tabsRef}
        >
          <FinancialReports />
        </TabsContent>
        
        <TabsContent 
          value="operational" 
          className="space-y-4"
          tabsRoot={tabsRef}
        >
          <TaskReporting />
        </TabsContent>
        
        <TabsContent 
          value="occupancy" 
          className="space-y-4"
          tabsRoot={tabsRef}
        >
          <OccupancyAnalysis />
        </TabsContent>
      </Tabs>
    </SwipeableTabsProvider>
  );
};
