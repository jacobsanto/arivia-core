
import React from 'react';
import { FileText, BarChart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TaskReporting from "@/components/tasks/TaskReporting";
import ScheduledReports from "@/components/analytics/ScheduledReports";
import CustomReportBuilder from "@/components/analytics/CustomReportBuilder";

const Reports = () => {
  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <FileText className="mr-2 h-7 w-7" /> Reports
          </h1>
          <p className="text-muted-foreground">
            View insights, generate reports, and analyze business data.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="task-reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="task-reports">Task Reports</TabsTrigger>
          <TabsTrigger value="scheduled-reports">Scheduled Reports</TabsTrigger>
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
    </div>
  );
};

export default Reports;
