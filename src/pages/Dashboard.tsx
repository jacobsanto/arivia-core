
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import PropertyFilter from "@/components/dashboard/PropertyFilter";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import BookingTrendsChart from "@/components/dashboard/BookingTrendsChart";
import TasksSchedule from "@/components/dashboard/TasksSchedule";
import { getDashboardData } from "@/utils/dashboardDataUtils";

const Dashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const { toast } = useToast();
  
  // Get filtered dashboard data based on selected property
  const dashboardData = getDashboardData(selectedProperty);

  const handlePropertyChange = (property: string) => {
    setSelectedProperty(property);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to the Arivia Villas management system.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <PropertyFilter 
            selectedProperty={selectedProperty}
            onPropertyChange={handlePropertyChange}
          />
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

      <DashboardMetrics data={dashboardData} />

      <div className="grid gap-6 md:grid-cols-2">
        <BookingTrendsChart data={dashboardData.bookings} />
        <TasksSchedule tasks={dashboardData.upcomingTasks} />
      </div>
    </div>
  );
};

export default Dashboard;
