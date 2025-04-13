
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  FileDown, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  CalendarRange, 
  Send, 
  Clock, 
  Users, 
  Save 
} from "lucide-react";
import { format, subDays } from "date-fns";
import { toastService } from "@/services/toast/toast.service";
import { exportToCSV, preparePrint } from "@/utils/reportExportUtils";

interface WeeklyReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyFilter: string;
  dashboardData: any;
}

export const WeeklyReviewDialog: React.FC<WeeklyReviewDialogProps> = ({
  open,
  onOpenChange,
  propertyFilter,
  dashboardData
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSchedulingReport, setIsSchedulingReport] = useState(false);
  
  // Generate dates for the weekly review
  const today = new Date();
  const startOfWeek = subDays(today, 6);
  const dateRange = `${format(startOfWeek, 'MMM d')} - ${format(today, 'MMM d, yyyy')}`;

  // Prepare week-over-week comparison (simplified for demo)
  const weekOverWeekData = {
    occupancy: {
      current: dashboardData.properties?.occupied || 0,
      previous: Math.max(0, (dashboardData.properties?.occupied || 0) - 1),
      change: 1,
    },
    revenue: {
      current: 4250,
      previous: 3800,
      change: 11.8,
    },
    taskCompletion: {
      current: dashboardData.tasks?.completed || 0,
      previous: Math.floor((dashboardData.tasks?.completed || 0) * 0.9),
      change: 10,
    },
    maintenanceIssues: {
      current: dashboardData.maintenance?.total || 0,
      previous: Math.ceil((dashboardData.maintenance?.total || 0) * 1.2),
      change: -20,
    }
  };

  // Calculate metrics change direction
  const getChangeDirection = (change: number) => change >= 0 ? "up" : "down";
  const getChangeClass = (change: number, isPositive: boolean) => 
    getChangeDirection(change) === "up" 
      ? (isPositive ? "text-green-600" : "text-red-600") 
      : (isPositive ? "text-red-600" : "text-green-600");
  
  // Handle export
  const handleExportReport = () => {
    const exportData = prepareWeeklyReportData();
    const filename = `Arivia_Weekly_Review_${propertyFilter === 'all' ? 'All_Properties' : propertyFilter.replace(/\s+/g, '_')}`;
    exportToCSV(exportData, filename);
    toastService.success("Weekly review exported", {
      description: `Report has been exported as ${filename}.csv`
    });
  };

  // Handle print
  const handlePrintReport = () => {
    const printData = prepareWeeklyReportData();
    const title = `Arivia Weekly Review - ${propertyFilter === 'all' ? 'All Properties' : propertyFilter}`;
    preparePrint(printData, title);
    toastService.success("Report ready for printing", {
      description: "Weekly review has been prepared for printing"
    });
  };

  // Handle save
  const handleSaveReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      toastService.success("Weekly review saved", {
        description: "Report has been saved to the Reports section"
      });
    }, 1500);
  };
  
  // Handle schedule
  const handleScheduleReport = () => {
    setIsSchedulingReport(true);
    setTimeout(() => {
      setIsSchedulingReport(false);
      toastService.success("Weekly report scheduled", {
        description: "Report will be delivered every Monday at 8:00 AM"
      });
    }, 1500);
  };
  
  // Prepare data for export
  const prepareWeeklyReportData = () => {
    const data = [
      { Metric: 'Date Range', Value: dateRange },
      { Metric: 'Property', Value: propertyFilter === 'all' ? 'All Properties' : propertyFilter },
      { Metric: 'Current Occupancy', Value: `${weekOverWeekData.occupancy.current} units` },
      { Metric: 'Previous Week Occupancy', Value: `${weekOverWeekData.occupancy.previous} units` },
      { Metric: 'Occupancy Change', Value: `${weekOverWeekData.occupancy.change}%` },
      { Metric: 'Current Revenue', Value: `€${weekOverWeekData.revenue.current}` },
      { Metric: 'Previous Week Revenue', Value: `€${weekOverWeekData.revenue.previous}` },
      { Metric: 'Revenue Change', Value: `${weekOverWeekData.revenue.change}%` },
      { Metric: 'Tasks Completed', Value: dashboardData.tasks?.completed || 0 },
      { Metric: 'Tasks Pending', Value: dashboardData.tasks?.pending || 0 },
      { Metric: 'Critical Maintenance Issues', Value: dashboardData.maintenance?.critical || 0 },
    ];
    
    // Add upcoming tasks if available
    if (dashboardData.upcomingTasks && dashboardData.upcomingTasks.length) {
      dashboardData.upcomingTasks.forEach((task: any, index: number) => {
        data.push({
          Metric: `Upcoming Task ${index + 1}`,
          Value: `${task.title} - Due: ${task.dueDate}`
        });
      });
    }
    
    return data;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Weekly Performance Review
          </DialogTitle>
          <DialogDescription>
            Performance overview for {propertyFilter === 'all' ? 'all properties' : propertyFilter} during {dateRange}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks & Maintenance</TabsTrigger>
              <TabsTrigger value="bookings">Bookings & Revenue</TabsTrigger>
              <TabsTrigger value="system">System Events</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-5 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Week-over-Week Performance</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  {dateRange}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Occupancy</CardTitle>
                    <CardDescription>Week-over-week change</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{weekOverWeekData.occupancy.current} units</p>
                        <p className="text-sm text-muted-foreground">Previous: {weekOverWeekData.occupancy.previous} units</p>
                      </div>
                      <div className={getChangeClass(weekOverWeekData.occupancy.change, true)}>
                        <span className="text-lg font-medium">{weekOverWeekData.occupancy.change}%</span>
                        <span className="ml-1">{getChangeDirection(weekOverWeekData.occupancy.change)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue</CardTitle>
                    <CardDescription>Week-over-week change</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">€{weekOverWeekData.revenue.current}</p>
                        <p className="text-sm text-muted-foreground">Previous: €{weekOverWeekData.revenue.previous}</p>
                      </div>
                      <div className={getChangeClass(weekOverWeekData.revenue.change, true)}>
                        <span className="text-lg font-medium">{weekOverWeekData.revenue.change}%</span>
                        <span className="ml-1">{getChangeDirection(weekOverWeekData.revenue.change)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Task Completion Rate</CardTitle>
                    <CardDescription>Week-over-week change</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{weekOverWeekData.taskCompletion.current} tasks</p>
                        <p className="text-sm text-muted-foreground">Previous: {weekOverWeekData.taskCompletion.previous} tasks</p>
                      </div>
                      <div className={getChangeClass(weekOverWeekData.taskCompletion.change, true)}>
                        <span className="text-lg font-medium">{weekOverWeekData.taskCompletion.change}%</span>
                        <span className="ml-1">{getChangeDirection(weekOverWeekData.taskCompletion.change)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Maintenance Issues</CardTitle>
                    <CardDescription>Week-over-week change</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{weekOverWeekData.maintenanceIssues.current} issues</p>
                        <p className="text-sm text-muted-foreground">Previous: {weekOverWeekData.maintenanceIssues.previous} issues</p>
                      </div>
                      <div className={getChangeClass(weekOverWeekData.maintenanceIssues.change, false)}>
                        <span className="text-lg font-medium">{Math.abs(weekOverWeekData.maintenanceIssues.change)}%</span>
                        <span className="ml-1">{getChangeDirection(weekOverWeekData.maintenanceIssues.change)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This week showed {weekOverWeekData.occupancy.change > 0 ? "an increase" : "a decrease"} in occupancy 
                    compared to last week, with {weekOverWeekData.occupancy.current} occupied units. Revenue 
                    {weekOverWeekData.revenue.change > 0 ? " increased by " : " decreased by "}
                    {Math.abs(weekOverWeekData.revenue.change)}%, resulting in €{weekOverWeekData.revenue.current} for the week.
                    Task completion rate {weekOverWeekData.taskCompletion.change > 0 ? "improved" : "declined"} 
                    with {weekOverWeekData.taskCompletion.current} completed tasks. Maintenance issues 
                    {weekOverWeekData.maintenanceIssues.change < 0 ? " decreased" : " increased"} 
                    to {weekOverWeekData.maintenanceIssues.current} active issues.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-5 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 text-green-800 p-4 rounded-md flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-2xl font-bold">{dashboardData.tasks?.completed || 0}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Pending</p>
                        <p className="text-2xl font-bold">{dashboardData.tasks?.pending || 0}</p>
                      </div>
                      <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                    
                    <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Critical Issues</p>
                        <p className="text-2xl font-bold">{dashboardData.maintenance?.critical || 0}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.upcomingTasks && dashboardData.upcomingTasks.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.upcomingTasks.map((task: any) => (
                        <div key={task.id} className="border rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "warning" : "outline"}>
                                {task.priority}
                              </Badge>
                              <span className="text-xs">{task.type}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{task.dueDate}</p>
                            <p className="text-xs text-muted-foreground">{task.property}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No upcoming tasks for this period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-5 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">Total Revenue</span>
                      <span className="text-xl">€{weekOverWeekData.revenue.current}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Accommodation</span>
                      <span>€{Math.round(weekOverWeekData.revenue.current * 0.85)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Additional Services</span>
                      <span>€{Math.round(weekOverWeekData.revenue.current * 0.12)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Other</span>
                      <span>€{Math.round(weekOverWeekData.revenue.current * 0.03)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Villa Caldera</p>
                          <p className="text-sm text-muted-foreground">4 guests</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          4 nights
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>Apr 15 - Apr 19, 2025</span>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Villa Azure</p>
                          <p className="text-sm text-muted-foreground">2 guests</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          7 nights
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>Apr 18 - Apr 25, 2025</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-5 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-full">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">High network latency detected</p>
                          <p className="text-xs text-muted-foreground">Notification service affected</p>
                        </div>
                      </div>
                      <Badge variant="outline">Apr 10, 2025</Badge>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">System backup completed</p>
                          <p className="text-xs text-muted-foreground">Weekly backup successful</p>
                        </div>
                      </div>
                      <Badge variant="outline">Apr 7, 2025</Badge>
                    </div>

                    <div className="border rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">New staff member onboarded</p>
                          <p className="text-xs text-muted-foreground">Housekeeping team</p>
                        </div>
                      </div>
                      <Badge variant="outline">Apr 5, 2025</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guesty API Connection Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Connection Status</span>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Sync</span>
                      <span className="text-sm">Today at 08:30 AM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Bookings Synced</span>
                      <span className="text-sm">12 bookings</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Properties Synced</span>
                      <span className="text-sm">5 properties</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex flex-wrap items-center gap-2 border-t pt-4 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Report
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrintReport}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportReport}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleScheduleReport}
            disabled={isSchedulingReport}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Schedule Delivery
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyReviewDialog;
