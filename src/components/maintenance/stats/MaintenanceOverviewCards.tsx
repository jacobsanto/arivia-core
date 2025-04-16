
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { ChartBar, CircleCheck, CircleX, Calendar } from "lucide-react";

interface MaintenanceOverviewCardsProps {
  tasks: MaintenanceTask[];
}

/**
 * Component for displaying overview summary cards in the maintenance stats view
 */
const MaintenanceOverviewCards = ({ tasks }: MaintenanceOverviewCardsProps) => {
  // Calculate statistics
  const statusCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  
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
  );
};

export default MaintenanceOverviewCards;
