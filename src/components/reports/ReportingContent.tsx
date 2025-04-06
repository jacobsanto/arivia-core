
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TaskReporting from "@/components/tasks/TaskReporting";
import ScheduledReports from "@/components/analytics/ScheduledReports";
import CustomReportBuilder from "@/components/analytics/CustomReportBuilder";

interface ReportingContentProps {
  reportsCount: number;
  isLoading: boolean;
}

export const ReportingContent: React.FC<ReportingContentProps> = ({
  reportsCount,
  isLoading
}) => {
  return (
    <Tabs defaultValue="task-reports" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="task-reports">
          Task Reports
          <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
            {isLoading ? '...' : reportsCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="scheduled-reports" data-value="scheduled-reports">Scheduled Reports</TabsTrigger>
        <TabsTrigger value="custom-reports">Custom Report Builder</TabsTrigger>
      </TabsList>
      
      <TabsContent value="task-reports" className="space-y-4">
        <TaskReporting />
      </TabsContent>
      
      <TabsContent value="scheduled-reports" className="space-y-4">
        <ScheduledReports />
      </TabsContent>
      
      <TabsContent value="custom-reports" className="space-y-4">
        <CustomReportBuilder />
      </TabsContent>
    </Tabs>
  );
};
