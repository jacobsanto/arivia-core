
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

interface StatusPieChartProps {
  tasks: MaintenanceTask[];
}

/**
 * Component for displaying task status distribution as a pie chart
 */
const StatusPieChart = ({ tasks }: StatusPieChartProps) => {
  // Calculate status statistics
  const statusCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Colors for chart
  const statusColors = {
    "Pending": "#3b82f6", // blue
    "In Progress": "#f59e0b", // amber
    "Completed": "#10b981", // green
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Tasks by Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[200px]">
          <ChartContainer 
            config={{
              status: {
                label: "Status"
              }
            }}
          >
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={statusColors[entry.name as keyof typeof statusColors] || "#8884d8"} 
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusPieChart;
