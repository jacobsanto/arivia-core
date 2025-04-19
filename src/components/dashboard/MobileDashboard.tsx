
import React, { useEffect, useCallback, useState } from "react";
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
import { SwipeIndicator } from "@/components/ui/swipe-indicator";

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
  const [currentTab, setCurrentTab] = useState("today");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const tabs = ["today", "calendar", "tasks"];
  
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  const navigateTab = (direction: "left" | "right") => {
    const currentIndex = tabs.indexOf(currentTab);
    let newIndex = currentIndex;
    
    if (direction === "left" && currentIndex < tabs.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === "right" && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    
    if (newIndex !== currentIndex) {
      setCurrentTab(tabs[newIndex]);
    }
  };

  const swipeHandler = useSwipe({
    onSwipeLeft: () => navigateTab("left"),
    onSwipeRight: () => navigateTab("right"),
    threshold: 50
  });

  const handlePullToRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await onRefresh();
    } catch (refreshError) {
      console.error('Refresh failed:', refreshError);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (isMobile) {
      let touchStartY = 0;
      
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };
      
      const handleTouchMove = async (e: TouchEvent) => {
        const touchEndY = e.touches[0].clientY;
        const diff = touchEndY - touchStartY;
        
        if (window.scrollY === 0) {
          setPullDistance(Math.max(0, Math.min(diff, 150)));
          
          if (diff > 100) {
            e.preventDefault();
          }
        }
      };
      
      const handleTouchEnd = async () => {
        if (pullDistance > 100) {
          await handlePullToRefresh();
        }
        setPullDistance(0);
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobile, handlePullToRefresh, pullDistance]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-destructive">
        <p>Failed to load dashboard: {error}</p>
      </div>
    );
  }

  const refreshIndicatorStyle = {
    transform: `translateY(${pullDistance}px)`,
    transition: isRefreshing ? 'none' : 'transform 0.2s ease-out'
  };

  return (
    <div 
      className="space-y-4 px-1 relative"
      {...swipeHandler}
    >
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center -translate-y-full z-10"
        style={refreshIndicatorStyle}
      >
        <LoadingSpinner 
          size="small"
          className={isRefreshing ? "animate-spin" : ""}
        />
      </div>

      <DashboardMetrics 
        data={dashboardData} 
        isLoading={isLoading}
        error={error}
      />
      
      <Separator className="my-4" />
      
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 mobile-scroll overflow-x-auto">
          <TabsTrigger value="today" className="flex items-center gap-1 min-h-[44px]">
            <CalendarClock className="h-4 w-4" />
            <span>Today</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1 min-h-[44px]">
            <CalendarDays className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1 min-h-[44px]">
            <LayoutDashboard className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="relative">
          <SwipeIndicator 
            direction="left" 
            visible={currentTab !== "tasks"}
            className="absolute right-2 top-1/2 -translate-y-1/2" 
          />
          <SwipeIndicator 
            direction="right" 
            visible={currentTab !== "today"}
            className="absolute left-2 top-1/2 -translate-y-1/2" 
          />
          
          <TabsContent value="today" className="mt-0">
            <DailyAgenda 
              housekeepingTasks={dashboardData?.housekeepingTasks?.slice(0, visibleItems) || []} 
              maintenanceTasks={dashboardData?.maintenanceTasks?.slice(0, visibleItems) || []} 
            />
            {dashboardData?.housekeepingTasks?.length > visibleItems && (
              <Button 
                variant="outline" 
                onClick={loadMore} 
                className="w-full mt-4 min-h-[44px]"
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
              housekeepingTasks={dashboardData?.housekeepingTasks || []} 
              maintenanceTasks={dashboardData?.maintenanceTasks || []} 
            />
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">All Tasks</h3>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MobileDashboard;
