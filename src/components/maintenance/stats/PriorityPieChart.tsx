
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

interface PriorityPieChartProps {
  tasks: MaintenanceTask[];
}

/**
 * Component for displaying task priority distribution as a pie chart
 */
const PriorityPieChart = ({ tasks }: PriorityPieChartProps) => {
  // Calculate priority statistics
  const priorityCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Colors for chart
  const priorityColors = {
    "High": "#ef4444", // red
    "Medium": "#f59e0b", // amber
    "Low": "#3b82f6", // blue
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Tasks by Priority</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[200px]">
          <ChartContainer 
            config={{
              priority: {
                label: "Priority"
              }
            }}
          >
            <PieChart>
              <Pie
                data={priorityData}
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
                {priorityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={priorityColors[entry.name as keyof typeof priorityColors] || "#8884d8"} 
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

export default PriorityPieChart;
