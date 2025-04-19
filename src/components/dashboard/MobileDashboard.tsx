
import React, { useEffect, useCallback } from "react";
import DashboardMetrics from "@/components/dashboard/metrics";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, LayoutDashboard, CalendarDays } from "lucide-react";
import DailyAgenda from "@/components/dashboard/DailyAgenda";
import TasksSchedule from "@/components/dashboard/TasksSchedule";
import { useMobileDashboard } from "@/hooks/use-mobile-dashboard";
import { useSwipe } from "@/hooks/use-swipe";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const { visibleItems, isLoadingMore, loadMore, isMobile } = useMobileDashboard(dashboardData);
  
  // Memoized swipe gesture handler to prevent unnecessary re-renders
  const swipeHandler = useSwipe({
    onSwipeLeft: () => {
      // TODO: Implement tab navigation logic
      console.log('Swiped Left');
    },
    onSwipeRight: () => {
      // TODO: Implement tab navigation logic
      console.log('Swiped Right');
    }
  });

  // Optimize pull-to-refresh with useCallback
  const handlePullToRefresh = useCallback(async () => {
    try {
      await onRefresh();
    } catch (refreshError) {
      console.error('Refresh failed:', refreshError);
    }
  }, [onRefresh]);

  // Enhanced pull-to-refresh effect with error handling
  useEffect(() => {
    if (isMobile) {
      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };
      
      const handleTouchMove = async (e: TouchEvent) => {
        const touchEndY = e.touches[0].clientY;
        const diff = touchEndY - touchStartY;
        
        if (diff > 100 && window.scrollY === 0) {
          await handlePullToRefresh();
        }
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isMobile, handlePullToRefresh]);

  // Render error state if data fetch fails
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-destructive">
        <p>Failed to load dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div 
      className="space-y-4 px-1"
      {...swipeHandler}
    >
      <DashboardMetrics 
        data={dashboardData} 
        isLoading={isLoading}
        error={error}
      />
      
      <Separator className="my-4" />
      
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 mobile-scroll overflow-x-auto">
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
            housekeepingTasks={dashboardData?.housekeepingTasks?.slice(0, visibleItems) || []} 
            maintenanceTasks={dashboardData?.maintenanceTasks?.slice(0, visibleItems) || []} 
          />
          {dashboardData?.housekeepingTasks?.length > visibleItems && (
            <Button 
              variant="outline" 
              onClick={loadMore} 
              className="w-full mt-4"
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <LoadingSpinner size="small" className="mr-2" />
              ) : null}
              Load More
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-0">
          <TasksSchedule 
            housekeepingTasks={dashboardData.housekeepingTasks || []} 
            maintenanceTasks={dashboardData.maintenanceTasks || []} 
          />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-0">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">All Tasks</h3>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileDashboard;
