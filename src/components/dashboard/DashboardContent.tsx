
import React, { memo, useEffect } from "react";
import DashboardMetrics from "@/components/dashboard/metrics"; // Use default import
import TasksSchedule from "@/components/dashboard/TasksSchedule";
import DailyAgenda from "@/components/dashboard/DailyAgenda";
import { useState } from "react";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarClock, CalendarDays } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface DashboardContentProps {
  dashboardData: any;
  isLoading?: boolean;
  error?: string | null;
  favoriteMetrics?: string[];
  onToggleFavorite?: (metricId: string) => void;
  onRefresh?: () => void;
  onAddSampleData?: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboardData,
  isLoading = false,
  error = null,
  favoriteMetrics = [],
  onToggleFavorite,
  onRefresh,
  onAddSampleData
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("daily");
  const isMobile = useIsMobile();
  
  // Use real data from dashboardData instead of mock data
  const housekeepingTasks: Task[] = dashboardData?.housekeepingTasks || [];
  const maintenanceTasks: MaintenanceTask[] = dashboardData?.maintenanceTasks || [];
  
  // Filter and process tasks based on the actual dashboard data
  useEffect(() => {
    if (dashboardData?.dateRange) {
      console.log("Dashboard data updated with date range:", dashboardData.dateRange);
      console.log("Housekeeping tasks:", housekeepingTasks.length);
      console.log("Maintenance tasks:", maintenanceTasks.length);
    }
  }, [dashboardData, housekeepingTasks.length, maintenanceTasks.length]);
  
  return (
    <ErrorBoundary onReset={onRefresh}>
      <div className="space-y-6 px-2 md:px-4">
        {/* Stats Cards - Now connected to real data with better UX */}
        <DashboardMetrics 
          data={dashboardData} 
          isLoading={isLoading}
          error={error}
          favoriteMetrics={favoriteMetrics}
          onToggleFavorite={onToggleFavorite}
          onRefresh={onRefresh}
          onAddSampleData={onAddSampleData}
        />
        
        {/* Separator */}
        <Separator className="my-6" />
        
        {/* Tasks Views - Daily Agenda and Calendar - Now using real data with better mobile UX */}
        <div className="w-full">
          <Tabs defaultValue="daily" className="w-full" onValueChange={setSelectedTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="shadow-sm">
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
                onRefresh={onRefresh}
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
    </ErrorBoundary>
  );
};

// Optimize rendering with memo
export default memo(DashboardContent);
