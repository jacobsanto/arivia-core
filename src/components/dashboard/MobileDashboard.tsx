import React, { useEffect } from "react";
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
  
  // Add swipe gestures for tab navigation
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: () => {
      // Navigate to next tab
    },
    onSwipeRight: () => {
      // Navigate to previous tab
    }
  });

  // Enable pull-to-refresh
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
          await onRefresh();
        }
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isMobile, onRefresh]);

  return (
    <div 
      className="space-y-4 px-1"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Metrics section with lazy loading */}
      <DashboardMetrics 
        data={dashboardData} 
        isLoading={isLoading}
        error={error}
      />
      
      <Separator className="my-4" />
      
      {/* Mobile optimized tabs */}
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
                <LoadingSpinner size="sm" className="mr-2" />
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
