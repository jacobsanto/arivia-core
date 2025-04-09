import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { BarChart, FileText, Clock, Calendar as CalendarIcon, Plus } from "lucide-react";
import TaskReporting from "@/components/tasks/TaskReporting";
import { FinancialReports } from "@/components/reports/analytics/FinancialReports";
import { OccupancyAnalysis } from "@/components/reports/analytics/OccupancyAnalysis";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileAnalyticsView from "@/components/reports/analytics/MobileAnalyticsView";

const Analytics = () => {
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileAnalyticsView />;
  }
  
  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <BarChart className="mr-2 h-7 w-7" /> Reporting & Analytics
          </h1>
          <p className="text-muted-foreground">
            View insights, track performance, and analyze business data.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="dashboards" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview Dashboard</CardTitle>
              <CardDescription>A quick overview of key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$24,780</div>
                    <p className="text-xs text-muted-foreground">+18% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">86%</div>
                    <p className="text-xs text-muted-foreground">+4% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-xs text-muted-foreground">+2% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
};

export default Analytics;
