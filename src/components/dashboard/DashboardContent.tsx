import React from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import BookingTrendsChart from "@/components/dashboard/BookingTrendsChart";
import TasksSchedule from "@/components/dashboard/TasksSchedule";
import { useEffect, useState } from "react";
import { Task } from "@/types/taskTypes"; 
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { initialTasks as initialHousekeepingTasks } from "@/data/taskData";
import { initialTasks as initialMaintenanceTasks } from "@/data/maintenanceTasks";

interface DashboardContentProps {
  dashboardData: any;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ dashboardData }) => {
  const [housekeepingTasks, setHousekeepingTasks] = useState<Task[]>(initialHousekeepingTasks);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialMaintenanceTasks);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <DashboardMetrics data={dashboardData} />
        <BookingTrendsChart data={dashboardData.bookings} />
      </div>
      
      <div>
        <TasksSchedule 
          housekeepingTasks={housekeepingTasks} 
          maintenanceTasks={maintenanceTasks}
        />
      </div>
    </div>
  );
};

export default DashboardContent;
