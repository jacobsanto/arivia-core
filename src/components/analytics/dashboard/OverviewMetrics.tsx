
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, Building, Calendar, ClipboardCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface OverviewMetricsProps {
  propertyFilter?: string;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ propertyFilter = "all" }) => {
  // Empty state - no more sample data
  const isEmpty = true;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isEmpty ? (
            <div>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                No property data available
              </p>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                0 occupied, 0 available
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isEmpty ? (
            <div>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                No occupancy data available
              </p>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                Average for current period
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isEmpty ? (
            <div>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                No task data available
              </p>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                0% completion rate
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isEmpty ? (
            <div>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                No scheduled tasks available
              </p>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Upcoming tasks this week
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
