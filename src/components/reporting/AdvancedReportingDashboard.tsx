import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, FileText, TrendingUp, Activity, Clock, CheckCircle, Wrench, Home, Package, Filter } from 'lucide-react';
import { ReportBuilder } from './ReportBuilder';
import { DataVisualization } from './DataVisualization';
import { ScheduledReports } from './ScheduledReports';
import { ExportCenter } from './ExportCenter';
import { useOperationalAnalytics } from '@/hooks/useOperationalAnalytics';
import { ExportDropdown } from '@/components/tasks/reporting/buttons/ExportDropdown';
import { getDateRangeForTimeFilter, getDateRangeDescription, formatDateRangeDisplay, TimeFilter } from '@/utils/dateRangeUtils';

export const AdvancedReportingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Date filter state and computed range
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('last30');
  const dateRange = getDateRangeForTimeFilter(timeFilter);
  
  
  const { metrics, loading } = useOperationalAnalytics(dateRange);

  // Operational analytics stats
  const reportingStats = [
    {
      title: "Housekeeping Tasks",
      value: metrics?.housekeeping.totalTasks.toString() || "0",
      icon: CheckCircle,
      color: "text-blue-600",
      trend: `${metrics?.housekeeping.completionRate.toFixed(1) || 0}% completion rate`,
    },
    {
      title: "Maintenance Tasks",
      value: metrics?.maintenance.totalTasks.toString() || "0",
      icon: Wrench,
      color: "text-orange-600", 
      trend: `${metrics?.maintenance.urgentTasks || 0} urgent`,
    },
    {
      title: "Active Properties",
      value: metrics?.properties.activeProperties.toString() || "0",
      icon: Home,
      color: "text-green-600",
      trend: `${metrics?.properties.damageReports || 0} damage reports`,
    },
    {
      title: "Inventory Usage",
      value: metrics?.inventory.totalUsage.toString() || "0",
      icon: Package,
      color: "text-purple-600",
      trend: `${metrics?.inventory.lowStockItems || 0} low stock items`,
    },
  ];

  const recentReports = [
    {
      id: 1,
      name: "Monthly Housekeeping Performance",
      type: "Housekeeping",
      lastRun: "2 hours ago",
      status: "completed",
      schedule: "Monthly"
    },
    {
      id: 2,
      name: "Weekly Maintenance Summary", 
      type: "Maintenance",
      lastRun: "1 day ago",
      status: "completed",
      schedule: "Weekly"
    },
    {
      id: 3,
      name: "Daily Operations Dashboard",
      type: "Operations",
      lastRun: "5 hours ago", 
      status: "running",
      schedule: "Daily"
    },
    {
      id: 4,
      name: "Property Performance Analysis",
      type: "Properties",
      lastRun: "3 days ago",
      status: "completed",
      schedule: "Weekly"
    },
    {
      id: 5,
      name: "Inventory Usage Report",
      type: "Inventory",
      lastRun: "6 hours ago",
      status: "completed",
      schedule: "Daily"
    }
  ];

  const quickReports = [
    {
      name: "Housekeeping Efficiency",
      description: "Task completion rates, turnaround times, and staff performance",
      type: "housekeeping"
    },
    {
      name: "Maintenance Overview",
      description: "Response times, costs, and equipment status",
      type: "maintenance"
    },
    {
      name: "Property Performance", 
      description: "Occupancy rates, damage reports, and property status",
      type: "properties"
    },
    {
      name: "Inventory Analysis",
      description: "Stock levels, usage patterns, and reorder recommendations",
      type: "inventory"
    },
    {
      name: "Staff Productivity",
      description: "Task assignments, completion rates, and performance metrics",
      type: "staff"
    }
  ];

  const exportData = loading || !metrics ? [] : [
    { Metric: 'Housekeeping Tasks', Total: metrics.housekeeping.totalTasks, 'Completion Rate (%)': metrics.housekeeping.completionRate },
    { Metric: 'Maintenance Tasks', Total: metrics.maintenance.totalTasks, 'Urgent Tasks': metrics.maintenance.urgentTasks, 'Avg Response (hrs)': metrics.maintenance.avgResponseTime },
    { Metric: 'Active Properties', Total: metrics.properties.activeProperties, 'Damage Reports': metrics.properties.damageReports },
    { Metric: 'Inventory Usage', Total: metrics.inventory.totalUsage, 'Low Stock Items': metrics.inventory.lowStockItems },
  ];
  const exportTitle = `Operational Analytics – ${getDateRangeDescription(timeFilter)}`;
  const exportFilename = `operational-analytics_${timeFilter}_${formatDateRangeDisplay(dateRange.from, dateRange.to).replace(/[\\/]/g, '-')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Operational Analytics</h2>
            <p className="text-muted-foreground">Real-time insights into housekeeping, maintenance, and property operations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter Reports
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>

        {/* Time Filters and Export */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {getDateRangeDescription(timeFilter)} · {formatDateRangeDisplay(dateRange.from, dateRange.to)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button variant={timeFilter === 'mtd' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('mtd')}>MTD</Button>
              <Button variant={timeFilter === 'last30' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('last30')}>30D</Button>
              <Button variant={timeFilter === 'qtd' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('qtd')}>QTD</Button>
              <Button variant={timeFilter === 'ytd' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('ytd')}>YTD</Button>
              <Button variant={timeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('all')}>All</Button>
            </div>
            <ExportDropdown data={exportData} filename={exportFilename} reportTitle={exportTitle} />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportingStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground font-medium">{stat.trend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Quick Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickReports.map((report, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                <h4 className="font-medium text-foreground mb-1">{report.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                <Button size="sm" variant="outline" className="w-full">
                  Generate Report
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Reporting Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.type}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{report.lastRun}</span>
                    <Badge 
                      variant={report.status === 'completed' ? 'default' : 
                              report.status === 'pending' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {report.status}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reporting Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="builder" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="builder">Report Builder</TabsTrigger>
              <TabsTrigger value="visualization">Data Visualization</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="export">Export Center</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-4">
              <ReportBuilder />
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              <DataVisualization />
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4">
              <ScheduledReports />
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <ExportCenter />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};