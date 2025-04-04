
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";

const dashboardData = {
  properties: {
    total: 32,
    occupied: 24,
    vacant: 8,
  },
  tasks: {
    total: 18,
    completed: 12,
    pending: 6,
  },
  maintenance: {
    total: 7,
    critical: 2,
    standard: 5,
  },
  bookings: [
    { month: "Jan", bookings: 24 },
    { month: "Feb", bookings: 28 },
    { month: "Mar", bookings: 32 },
    { month: "Apr", bookings: 38 },
    { month: "May", bookings: 42 },
    { month: "Jun", bookings: 48 },
  ],
  upcomingTasks: [
    {
      id: 1,
      title: "Villa Caldera Cleaning",
      type: "Housekeeping",
      dueDate: "Today, 2:00 PM",
      priority: "high",
    },
    {
      id: 2,
      title: "Villa Azure Maintenance",
      type: "Maintenance",
      dueDate: "Today, 4:30 PM",
      priority: "medium",
    },
    {
      id: 3,
      title: "Villa Sunset Restocking",
      type: "Inventory",
      dueDate: "Tomorrow, 10:00 AM",
      priority: "medium",
    },
    {
      id: 4,
      title: "Villa Oceana Inspection",
      type: "Housekeeping",
      dueDate: "Tomorrow, 1:00 PM",
      priority: "low",
    },
  ],
};

const Dashboard = () => {
  const date = new Date();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to the Arivia Villas management system.
          </p>
        </div>
        <div>
          <Button variant="outline" onClick={() => {
            toast({
              title: "Reports Generated",
              description: "Monthly reports have been emailed to your inbox.",
            });
          }}>
            Generate Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Properties"
          value={dashboardData.properties.total.toString()}
          description="Properties Managed"
          footer={
            <div className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">{dashboardData.properties.occupied}</span> Occupied | 
              <span className="text-blue-500 font-medium"> {dashboardData.properties.vacant}</span> Vacant
            </div>
          }
        />
        <StatsCard
          title="Tasks"
          value={dashboardData.tasks.total.toString()}
          description="Active Tasks"
          footer={
            <div className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">{dashboardData.tasks.completed}</span> Completed | 
              <span className="text-amber-500 font-medium"> {dashboardData.tasks.pending}</span> Pending
            </div>
          }
        />
        <StatsCard
          title="Maintenance"
          value={dashboardData.maintenance.total.toString()}
          description="Maintenance Issues"
          footer={
            <div className="text-xs text-muted-foreground">
              <span className="text-red-500 font-medium">{dashboardData.maintenance.critical}</span> Critical | 
              <span className="text-blue-500 font-medium"> {dashboardData.maintenance.standard}</span> Standard
            </div>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Monthly booking statistics</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.bookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="bookings"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Upcoming tasks and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={date}
                className="rounded-md border"
              />
              
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-sm">Upcoming Tasks</h4>
                {dashboardData.upcomingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  footer?: React.ReactNode;
}

const StatsCard = ({ title, value, description, footer }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {footer && <div className="mt-2">{footer}</div>}
    </CardContent>
  </Card>
);

interface TaskItemProps {
  task: {
    id: number;
    title: string;
    type: string;
    dueDate: string;
    priority: string;
  };
}

const TaskItem = ({ task }: TaskItemProps) => {
  const priorityColor = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-blue-100 text-blue-800",
  }[task.priority];

  return (
    <div className="flex items-center justify-between p-2 border rounded-md hover:bg-secondary cursor-pointer">
      <div className="flex flex-col">
        <span className="font-medium text-sm">{task.title}</span>
        <span className="text-xs text-muted-foreground">{task.dueDate}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`px-2 py-1 rounded-md text-xs ${priorityColor}`}>
          {task.priority}
        </div>
        <Badge variant="outline">{task.type}</Badge>
      </div>
    </div>
  );
};

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default Dashboard;
