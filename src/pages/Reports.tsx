
import React, { useEffect } from 'react';
import { FileText, BarChart, Clock, Layers, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TaskReporting from "@/components/tasks/TaskReporting";
import ScheduledReports from "@/components/analytics/ScheduledReports";
import CustomReportBuilder from "@/components/analytics/CustomReportBuilder";
import { toastService } from "@/services/toast/toast.service";
import { useReports } from '@/hooks/useReports';
import { Badge } from '@/components/ui/badge';

const Reports = () => {
  // Initialize the reports hook for task reports
  const { reports, isLoading, loadReports } = useReports('task');

  useEffect(() => {
    // Load reports when the component mounts
    loadReports();
  }, []);

  // Function to handle how users can get help with reports
  const handleHelpRequest = () => {
    toastService.info("Help Center", {
      description: "Our reporting documentation has been opened in a new tab."
    });
    // In a real app, this would open actual documentation
    window.open("https://example.com/help/reports", "_blank");
  };

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleHelpRequest}>
            Help & Documentation
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" /> Filters:
        </div>
        <Badge variant="outline" className="bg-muted/50">
          <Clock className="mr-1 h-3 w-3" /> Last 30 Days
        </Badge>
        <Badge variant="outline" className="bg-muted/50">
          <Layers className="mr-1 h-3 w-3" /> All Properties
        </Badge>
        <Button variant="ghost" size="sm" className="text-xs h-7">
          + Add Filter
        </Button>
      </div>
      
      <Tabs defaultValue="task-reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="task-reports">
            Task Reports
            <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
              {isLoading ? '...' : reports.length}
            </span>
          </TabsTrigger>
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
