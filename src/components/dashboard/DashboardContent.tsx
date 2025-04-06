
import React from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import BookingTrendsChart from "@/components/dashboard/BookingTrendsChart";
import TasksSchedule from "@/components/dashboard/TasksSchedule";

interface DashboardContentProps {
  dashboardData: any;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ dashboardData }) => {
  return (
    <>
      <DashboardMetrics data={dashboardData} />

      <div className="grid gap-6 md:grid-cols-2">
        <BookingTrendsChart data={dashboardData.bookings} />
        <TasksSchedule tasks={dashboardData.upcomingTasks} />
      </div>
    </>
  );
};

export default DashboardContent;
