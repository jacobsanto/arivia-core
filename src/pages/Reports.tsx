import React, { useState, useEffect } from 'react';
import { FileText, BarChart, Clock, Layers, Filter, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TaskReporting from "@/components/tasks/TaskReporting";
import ScheduledReports from "@/components/analytics/ScheduledReports";
import CustomReportBuilder from "@/components/analytics/CustomReportBuilder";
import { toastService } from "@/services/toast/toast.service";
import { useReports } from '@/hooks/useReports';
import { Badge } from '@/components/ui/badge';
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';

const Reports = () => {
  // Initialize the reports hook for task reports
  const { reports, isLoading, loadReports } = useReports('task');
  const [activeView, setActiveView] = useState('reporting'); // reporting, analytics
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  });

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

  const handleCreateReport = () => {
    // Switch to reports tab and trigger new report dialog
    setActiveView('reporting');
    
    // Fix: Cast the Element to HTMLElement to use the click method
    const element = document.querySelector('[data-value="scheduled-reports"]');
    if (element) {
      (element as HTMLElement).click();
    }
    
    // The scheduled reports component will handle showing the dialog
    toastService.info("Create Report", {
      description: "Select your report type and configure settings."
    });
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            {activeView === 'reporting' ? (
              <>
                <FileText className="mr-2 h-7 w-7" /> Reports
              </>
            ) : (
              <>
                <BarChart className="mr-2 h-7 w-7" /> Analytics
              </>
            )}
          </h1>
          <p className="text-muted-foreground">
            {activeView === 'reporting' ? 
              "View insights, generate reports, and analyze business data." :
              "View insights, track performance, and analyze business data."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveView(activeView === 'reporting' ? 'analytics' : 'reporting')}
          >
            {activeView === 'reporting' ? (
              <>
                <BarChart className="mr-2 h-4 w-4" />
                Switch to Analytics
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Switch to Reports
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleHelpRequest}>
            Help & Documentation
          </Button>
          <Button onClick={handleCreateReport}>
            <Plus className="mr-2 h-4 w-4" />
            New Report
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
        <div className="flex-grow"></div>
        <div className="w-full sm:w-auto max-w-[300px]">
          <DateRangeSelector 
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>
      
      {activeView === 'reporting' ? (
        <Tabs defaultValue="task-reports" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="task-reports">
              Task Reports
              <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
                {isLoading ? '...' : reports.length}
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
      ) : (
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
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Track revenue, expenses, and profitability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Available Reports</label>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Revenue by Property
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Expense Analysis
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Profit & Loss Statement
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="operational" className="space-y-4">
            <TaskReporting />
          </TabsContent>
          
          <TabsContent value="occupancy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Analysis</CardTitle>
                <CardDescription>Analyze booking patterns and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-64 space-y-2">
                    <label className="text-sm font-medium">Select Property</label>
                    <select className="w-full border rounded-md p-2">
                      <option value="all">All Properties</option>
                      <option value="Villa Caldera">Villa Caldera</option>
                      <option value="Villa Sunset">Villa Sunset</option>
                      <option value="Villa Oceana">Villa Oceana</option>
                      <option value="Villa Paradiso">Villa Paradiso</option>
                      <option value="Villa Azure">Villa Azure</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Available Reports</label>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Monthly Occupancy Rates
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Clock className="mr-2 h-4 w-4" />
                        Average Length of Stay
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart className="mr-2 h-4 w-4" />
                        Seasonal Booking Trends
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Reports;
