
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface MaintenanceOverviewProps {
  propertyFilter?: string;
}

export const MaintenanceOverview: React.FC<MaintenanceOverviewProps> = ({ propertyFilter = "all" }) => {
  // Empty state demo
  const isEmpty = true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Overview</CardTitle>
        <CardDescription>Maintenance tasks by priority for {propertyFilter === "all" ? "all properties" : propertyFilter}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <Alert className="bg-muted/50">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No maintenance data</AlertTitle>
            <AlertDescription>
              Maintenance task data will appear here when records are added to the database.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[]}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="high" fill="#ef4444" />
                <Bar dataKey="medium" fill="#f59e0b" />
                <Bar dataKey="low" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
