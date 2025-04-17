
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewMetrics } from "./dashboard/OverviewMetrics";
import { PropertyStatusChart } from "./dashboard/PropertyStatusChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Revenue } from "./dashboard/Revenue";
import { TasksCompletion } from "./dashboard/TasksCompletion";
import { MaintenanceOverview } from "./dashboard/MaintenanceOverview";

interface AnalyticsDashboardProps {
  showAllCharts?: boolean;
  showMonitoring?: boolean;
  propertyFilter?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  showAllCharts = true,
  showMonitoring = false,
  propertyFilter = "all"
}) => {
  return (
    <div className="space-y-4">
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Analytics Dashboard</AlertTitle>
            <AlertDescription>
              This is a placeholder dashboard. Connect to real data sources by adding database records 
              to your financial_reports, occupancy_reports, and other tables.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      <OverviewMetrics propertyFilter={propertyFilter} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PropertyStatusChart propertyFilter={propertyFilter} />
        <Revenue propertyFilter={propertyFilter} />
      </div>
      
      {showAllCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TasksCompletion propertyFilter={propertyFilter} />
          <MaintenanceOverview propertyFilter={propertyFilter} />
        </div>
      )}
      
      {showMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle>Live Monitoring</CardTitle>
            <CardDescription>System metrics and performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="performance">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>
              <TabsContent value="performance" className="space-y-4 py-4">
                <Alert className="bg-muted/50">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No performance data</AlertTitle>
                  <AlertDescription>
                    Connect real-time monitoring tools to see system performance metrics.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              <TabsContent value="alerts" className="py-4">
                <Alert className="bg-muted/50">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No alerts</AlertTitle>
                  <AlertDescription>
                    System alerts will appear here when detected.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
