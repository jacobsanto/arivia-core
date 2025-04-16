
import React from "react";
import { DashboardMetrics } from "@/components/dashboard/metrics";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, LayoutDashboard, CalendarDays } from "lucide-react";
import DailyAgenda from "@/components/dashboard/DailyAgenda";
import TasksSchedule from "@/components/dashboard/TasksSchedule";

interface MobileDashboardProps {
  dashboardData: any;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ 
  dashboardData, 
  onRefresh,
  isLoading = false,
  error = null
}) => {
  return (
    <div className="space-y-4 px-1">
      {/* Metrics section */}
      <DashboardMetrics 
        data={dashboardData} 
        isLoading={isLoading}
        error={error}
      />
      
      <Separator className="my-4" />
      
      {/* Mobile tabs for task views */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="today" className="flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            <span>Today</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-0">
          <DailyAgenda 
            housekeepingTasks={dashboardData.housekeepingTasks || []} 
            maintenanceTasks={dashboardData.maintenanceTasks || []} 
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-0">
          <TasksSchedule 
            housekeepingTasks={dashboardData.housekeepingTasks || []} 
            maintenanceTasks={dashboardData.maintenanceTasks || []} 
          />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-0">
          <div className="space-y-4">
            {/* Tasks summary would go here */}
            <h3 className="text-lg font-medium">All Tasks</h3>
            {/* Task list component would go here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileDashboard;
