
import React from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import TasksSchedule from "@/components/dashboard/TasksSchedule";
import DailyAgenda from "@/components/dashboard/DailyAgenda";
import { useEffect, useState } from "react";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { initialTasks as initialHousekeepingTasks } from "@/data/taskData";
import { initialTasks as initialMaintenanceTasks } from "@/data/maintenanceTasks";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarClock, CalendarDays } from "lucide-react";

interface DashboardContentProps {
  dashboardData: any;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboardData
}) => {
  const [housekeepingTasks, setHousekeepingTasks] = useState<Task[]>(initialHousekeepingTasks);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialMaintenanceTasks);
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState<string>("daily");
  
  return (
    <div className="space-y-6 px-2 md:px-4">
      {/* Stats Cards */}
      <DashboardMetrics data={dashboardData} />
      
      {/* Separator */}
      <Separator className="my-6" />
      
      {/* Tasks Views - Daily Agenda and Calendar */}
      <div className="w-full">
        <Tabs defaultValue="daily" className="w-full" onValueChange={setSelectedTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                <span className="hidden sm:inline">Daily Agenda</span>
                <span className="sm:hidden">Today</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar View</span>
                <span className="sm:hidden">Calendar</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="daily" className="mt-0">
            <DailyAgenda 
              housekeepingTasks={housekeepingTasks} 
              maintenanceTasks={maintenanceTasks} 
            />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            <TasksSchedule 
              housekeepingTasks={housekeepingTasks} 
              maintenanceTasks={maintenanceTasks} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardContent;
