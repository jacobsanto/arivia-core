
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface PropertyStatusChartProps {
  propertyFilter?: string;
}

export const PropertyStatusChart: React.FC<PropertyStatusChartProps> = ({ propertyFilter = "all" }) => {
  // Placeholder data - in real app would come from your API
  const propertyStatusData = [
    { name: "Occupied", value: 3, color: "#22c55e" },
    { name: "Available", value: 1, color: "#3b82f6" },
    { name: "Maintenance", value: 1, color: "#f59e0b" }
  ];

  // Show empty state if property-specific view is chosen
  const showEmptyState = propertyFilter !== "all";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Status</CardTitle>
        <CardDescription>Current status of all properties</CardDescription>
      </CardHeader>
      <CardContent>
        {showEmptyState ? (
          <Alert className="bg-muted/50">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Single property selected</AlertTitle>
            <AlertDescription>
              Property status breakdown is available when viewing all properties.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {propertyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
