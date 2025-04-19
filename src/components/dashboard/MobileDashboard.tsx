
import React, { useEffect, useCallback, useState, memo, useMemo } from "react";
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
import { useSwipeHint } from "@/hooks/useSwipeHint";
import { Skeleton } from "@/components/ui/skeleton";

interface MobileDashboardProps {
  dashboardData: any;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// Memoize components for performance
const MemoizedDailyAgenda = memo(DailyAgenda);
const MemoizedTasksSchedule = memo(TasksSchedule);
const MemoizedDashboardMetrics = memo(DashboardMetrics);

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
  const { showSwipeHint, resetSwipeHint } = useSwipeHint();
  
  // Define tabs for navigation
  const tabs = useMemo(() => ["today", "calendar", "tasks"], []);
  
  const handleTabChange = useCallback((value: string) => {
    setCurrentTab(value);
    if (showSwipeHint) resetSwipeHint();
  }, [showSwipeHint, resetSwipeHint]);

  const navigateTab = useCallback((direction: "left" | "right") => {
    const currentIndex = tabs.indexOf(currentTab);
    let newIndex = currentIndex;
    
    if (direction === "left" && currentIndex < tabs.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === "right" && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    
    if (newIndex !== currentIndex) {
      setCurrentTab(tabs[newIndex]);
      if (showSwipeHint) resetSwipeHint();
    }
  }, [currentTab, tabs, showSwipeHint, resetSwipeHint]);

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
  
  // Optimized pull-to-refresh implementation with improved touch handling
  useEffect(() => {
    if (isMobile) {
      let touchStartY = 0;
      let scrollPosition = 0;
      
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
        scrollPosition = window.scrollY;
      };
      
      const handleTouchMove = async (e: TouchEvent) => {
        // Only enable pull-to-refresh at top of page
        if (scrollPosition > 0 || window.scrollY > 0) return;

        const touchEndY = e.touches[0].clientY;
        const diff = touchEndY - touchStartY;
        
        if (diff > 0) {
          // Apply resistance factor for natural feel
          const resistance = 0.4;
          setPullDistance(Math.max(0, Math.min(diff * resistance, 150)));
          
          if (diff > 100) {
            e.preventDefault();
          }
        }
      };
      
      const handleTouchEnd = async () => {
        if (pullDistance > 100 && !isRefreshing) {
          await handlePullToRefresh();
        } else {
          // Add a smooth spring-back animation
          setPullDistance(0);
        }
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
  }, [isMobile, handlePullToRefresh, pullDistance, isRefreshing]);

  // Create memoized error view
  const errorView = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="flex items-center justify-center h-full p-4 text-destructive bg-destructive/10 rounded-md">
        <p className="text-center">Failed to load dashboard: {error}</p>
      </div>
    );
  }, [error]);

  // For better performance during animations
  const refreshIndicatorStyle = useMemo(() => ({
    transform: `translateY(${pullDistance}px)`,
    transition: isRefreshing ? 'none' : 'transform 0.2s ease-out'
  }), [pullDistance, isRefreshing]);

  // Progressive loading for task content
  const renderTaskContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="space-y-4 py-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }
    
    if (error) return errorView;
    
    return (
      <>
        <MemoizedDailyAgenda 
          housekeepingTasks={dashboardData?.housekeepingTasks?.slice(0, visibleItems) || []} 
          maintenanceTasks={dashboardData?.maintenanceTasks?.slice(0, visibleItems) || []} 
          onRefresh={onRefresh}
        />
        {(dashboardData?.housekeepingTasks?.length || 0) > visibleItems && (
          <Button 
            variant="outline" 
            onClick={loadMore} 
            className="w-full mt-4 min-h-[44px] touch-feedback fast-tap"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <LoadingSpinner size="small" className="mr-2" />
            ) : null}
            Load More
          </Button>
        )}
      </>
    );
  }, [dashboardData, visibleItems, loadMore, isLoadingMore, isLoading, error, errorView, onRefresh]);

  // If a critical error occurred, show full-page error
  if (error && !dashboardData) {
    return errorView;
  }

  return (
    <div 
      className="space-y-4 px-1 relative hardware-accelerated"
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

      <MemoizedDashboardMetrics 
        data={dashboardData} 
        isLoading={isLoading}
        error={error}
      />
      
      <Separator className="my-4" />
      
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 mobile-scroll overflow-x-auto">
          <TabsTrigger value="today" className="flex items-center gap-1 min-h-[44px] fast-tap">
            <CalendarClock className="h-4 w-4" />
            <span>Today</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1 min-h-[44px] fast-tap">
            <CalendarDays className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1 min-h-[44px] fast-tap">
            <LayoutDashboard className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="relative">
          {showSwipeHint && (
            <>
              <SwipeIndicator 
                direction="left" 
                visible={currentTab !== "tasks"}
                className="absolute right-2 top-1/2 -translate-y-1/2" 
                variant="solid"
              />
              <SwipeIndicator 
                direction="right" 
                visible={currentTab !== "today"}
                className="absolute left-2 top-1/2 -translate-y-1/2" 
                variant="solid"
              />
            </>
          )}
          
          <TabsContent value="today" className="mt-0 contain-layout">
            {renderTaskContent()}
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0 contain-layout">
            <MemoizedTasksSchedule 
              housekeepingTasks={dashboardData?.housekeepingTasks || []} 
              maintenanceTasks={dashboardData?.maintenanceTasks || []} 
            />
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-0 contain-layout">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">All Tasks</h3>
              <div className="space-y-2">
                {isLoading ? (
                  Array(3).fill(null).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (
                  <SwipeableList
                    items={(dashboardData?.housekeepingTasks || []).concat(dashboardData?.maintenanceTasks || [])}
                    renderItem={(task) => (
                      <div className="p-3 bg-card rounded-md shadow-sm">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">{task.property}</div>
                      </div>
                    )}
                    keyExtractor={(item) => item.id}
                    onSwipeLeft={(item) => console.log('Swiped left on', item.title)}
                    onSwipeRight={(item) => console.log('Swiped right on', item.title)}
                    swipeLeftText="Delete"
                    swipeRightText="Complete"
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Enhanced swipeable list component for task management
const SwipeableList = ({
  items,
  renderItem,
  keyExtractor,
  onSwipeLeft,
  onSwipeRight,
  swipeLeftText,
  swipeRightText
}) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div 
          key={keyExtractor(item, index)}
          className="touch-ripple relative transform transition-transform hardware-accelerated"
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

export default MobileDashboard;
