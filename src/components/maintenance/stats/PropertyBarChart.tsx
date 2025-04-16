
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, Cell } from "recharts";

interface PropertyBarChartProps {
  tasks: MaintenanceTask[];
}

/**
 * Component for displaying property distribution as a bar chart
 */
const PropertyBarChart = ({ tasks }: PropertyBarChartProps) => {
  // Calculate property statistics
  const propertyCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.property] = (acc[task.property] || 0) + 1;
    return acc;
  }, {});

  const propertyData = Object.entries(propertyCounts)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 properties

  // Colors for chart
  const propertyColors = [
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#14b8a6", // teal
    "#f97316", // orange
  ];

  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Tasks by Property</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[200px]">
          <ChartContainer 
            config={{
              property: {
                label: "Property"
              }
            }}
          >
            <BarChart data={propertyData}>
              <Bar dataKey="value" fill="#8884d8">
                {propertyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={propertyColors[index % propertyColors.length]} 
                  />
                ))}
              </Bar>
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyBarChart;
