
import React, { useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, SwipeableTabsProvider } from "@/components/ui/tabs";
import TaskReporting from "@/components/tasks/TaskReporting";
import ScheduledReports from "@/components/analytics/ScheduledReports";
import CustomReportBuilder from "@/components/analytics/CustomReportBuilder";
import { useIsMobile } from "@/hooks/use-mobile";
import { FromAnalyticsTab } from '@/components/analytics/reports/FromAnalyticsTab';
import { useReports } from '@/hooks/useReports';

interface ReportingContentProps {
  reportsCount: number;
  isLoading: boolean;
}

export const ReportingContent: React.FC<ReportingContentProps> = ({
  reportsCount,
  isLoading
}) => {
  const isMobile = useIsMobile();
  const tabsRef = useRef(null);
  
  // Use reports hooks to get scheduled and custom reports counts
  const { reports: scheduledReports, loadReports: loadScheduledReports, isAuthenticated: isScheduledAuth } = useReports('custom');
  
  useEffect(() => {
    if (isScheduledAuth) {
      loadScheduledReports();
    }
  }, [isScheduledAuth]);
  
  return (
    <SwipeableTabsProvider>
      <Tabs ref={tabsRef} defaultValue="task-reports" className="space-y-4">
        <TabsList className="w-full scroll-tabs mb-4">
          <TabsTrigger value="task-reports" className="truncate">
            Task Reports
            <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
              {isLoading ? '...' : reportsCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="scheduled-reports" data-value="scheduled-reports" className="truncate">
            Scheduled Reports
            <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
              {isLoading ? '...' : scheduledReports.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="custom-reports" className="truncate">
            Custom Reports
          </TabsTrigger>
          <TabsTrigger value="analytics-reports" className="truncate">
            From Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="task-reports" className="space-y-4" tabsRoot={tabsRef}>
          <TaskReporting />
        </TabsContent>
        
        <TabsContent value="scheduled-reports" className="space-y-4" tabsRoot={tabsRef}>
          <ScheduledReports />
        </TabsContent>
        
        <TabsContent value="custom-reports" className="space-y-4" tabsRoot={tabsRef}>
          <CustomReportBuilder />
        </TabsContent>
        
        <TabsContent value="analytics-reports" className="space-y-4" tabsRoot={tabsRef}>
          <FromAnalyticsTab />
        </TabsContent>
      </Tabs>
    </SwipeableTabsProvider>
  );
};
