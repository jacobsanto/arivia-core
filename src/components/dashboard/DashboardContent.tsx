
import React from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import TasksSchedule from "@/components/dashboard/TasksSchedule";
import { useEffect, useState } from "react";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { initialTasks as initialHousekeepingTasks } from "@/data/taskData";
import { initialTasks as initialMaintenanceTasks } from "@/data/maintenanceTasks";
import { Separator } from "@/components/ui/separator";

interface DashboardContentProps {
  dashboardData: any;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboardData
}) => {
  const [housekeepingTasks, setHousekeepingTasks] = useState<Task[]>(initialHousekeepingTasks);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialMaintenanceTasks);
  
  return (
    <div className="space-y-6 px-2 md:px-4">
      {/* Stats Cards */}
      <DashboardMetrics data={dashboardData} />
      
      {/* Separator */}
      <Separator className="my-6" />
      
      {/* Tasks Schedule with improved responsiveness */}
      <div className="w-full">
        <TasksSchedule 
          housekeepingTasks={housekeepingTasks} 
          maintenanceTasks={maintenanceTasks} 
        />
      </div>
    </div>
  );
};

export default DashboardContent;
