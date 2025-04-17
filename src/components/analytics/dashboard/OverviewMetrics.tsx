
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, Building, Calendar, ClipboardCheck } from "lucide-react";

interface OverviewMetricsProps {
  propertyFilter?: string;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ propertyFilter = "all" }) => {
  // Placeholder data - in real app would come from your API
  const metricsData = {
    properties: {
      total: 5,
      occupied: 3,
      available: 2
    },
    occupancyRate: 85,
    totalTasks: 48,
    taskCompletion: 92
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricsData.properties.total}</div>
          <p className="text-xs text-muted-foreground">
            {metricsData.properties.occupied} occupied, {metricsData.properties.available} available
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricsData.occupancyRate}%</div>
          <p className="text-xs text-muted-foreground">
            Average for current period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricsData.totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            {metricsData.taskCompletion}% completion rate
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            Upcoming tasks this week
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
