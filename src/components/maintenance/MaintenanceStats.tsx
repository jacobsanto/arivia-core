
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CircleCheck, CircleX, Clock, Calendar, ChartBar, ChartPie } from "lucide-react";

interface MaintenanceStatsProps {
  tasks: MaintenanceTask[];
}

const MaintenanceStats = ({ tasks }: MaintenanceStatsProps) => {
  // Calculate status statistics
  const statusCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate priority statistics
  const priorityCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({
    name,
    value,
  }));

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

  // Colors for charts
  const statusColors = {
    "Pending": "#3b82f6", // blue
    "In Progress": "#f59e0b", // amber
    "Completed": "#10b981", // green
  };
  
  const priorityColors = {
    "High": "#ef4444", // red
    "Medium": "#f59e0b", // amber
    "Low": "#3b82f6", // blue
  };

  const propertyColors = [
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#14b8a6", // teal
    "#f97316", // orange
  ];

  // Due dates analysis
  const overdueCount = tasks.filter(
    task => task.status !== "Completed" && new Date(task.dueDate) < new Date()
  ).length;
  
  const dueTodayCount = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return (
      task.status !== "Completed" &&
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const taskCompletionRate = tasks.length > 0 
    ? Math.round((statusCounts["Completed"] || 0) / tasks.length * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Maintenance Stats</h2>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CircleCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCompletionRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <CircleX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueTodayCount}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Distribution */}
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
        
        {/* Priority Distribution */}
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
        
        {/* Property Distribution (Top 5) */}
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
      </div>
    </div>
  );
};

export default MaintenanceStats;
