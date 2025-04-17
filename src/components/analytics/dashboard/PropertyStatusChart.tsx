
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface PropertyStatusChartProps {
  propertyFilter?: string;
}

export const PropertyStatusChart: React.FC<PropertyStatusChartProps> = ({ propertyFilter = "all" }) => {
  // Empty state - no data
  const isEmpty = true;
  
  // Show empty state if property-specific view is chosen or if we're in empty state
  const showEmptyState = propertyFilter !== "all" || isEmpty;

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
            <AlertTitle>
              {propertyFilter !== "all" ? "Single property selected" : "No property data"}
            </AlertTitle>
            <AlertDescription>
              {propertyFilter !== "all" 
                ? "Property status breakdown is available when viewing all properties."
                : "Property status breakdown will appear here when properties are added."}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[].map((entry: any, index: number) => (
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
