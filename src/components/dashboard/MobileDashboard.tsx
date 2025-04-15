
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import DashboardMetrics from "./DashboardMetrics";
import { Calendar, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import DailyAgenda from "./DailyAgenda";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwipe } from "@/hooks/use-swipe";
import { SwipeIndicator } from "@/components/ui/swipe-indicator";
import { toast } from "sonner";
import TaskCreationDialogs from "./TaskCreationDialogs";
import { useTasks } from "@/hooks/useTasks";
import { useMaintenanceTasks } from "@/hooks/useMaintenanceTasks";
import MobileDashboardActions from "./mobile/MobileDashboardActions";

interface MobileDashboardProps {
  dashboardData: any;
  onRefresh?: () => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ dashboardData, onRefresh }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("today");
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  
  // Task creation dialog states
  const [isCleaningDialogOpen, setIsCleaningDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  
  // Get task handlers from hooks
  const { handleCreateTask: handleCleaningTaskCreate } = useTasks();
  const { handleCreateTask: handleMaintenanceTaskCreate } = useMaintenanceTasks();
  
  // Configure swipe gestures
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: () => {
      if (selectedTab === "today") {
        setSelectedTab("actions");
      }
    },
    onSwipeRight: () => {
      if (selectedTab === "actions") {
        setSelectedTab("today");
      }
    }
  });
  
  // Hide swipe hint after a few seconds
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);
  
  // Show swipe toast message for first-time users
  useEffect(() => {
    const hasSeenSwipeTip = localStorage.getItem('seen_swipe_tip');
    if (!hasSeenSwipeTip) {
      toast("Swipe Tip", {
        description: "Swipe left or right to navigate between tabs",
        duration: 5000,
      });
      localStorage.setItem('seen_swipe_tip', 'true');
    }
  }, []);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast.success("Dashboard updated");
    }
  };

  return (
    <div 
      className="space-y-4 relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Stats Cards */}
      <DashboardMetrics data={dashboardData} />
      
      {/* Task Creation Dialogs */}
      <TaskCreationDialogs 
        isCleaningDialogOpen={isCleaningDialogOpen}
        setIsCleaningDialogOpen={setIsCleaningDialogOpen}
        isMaintenanceDialogOpen={isMaintenanceDialogOpen}
        setIsMaintenanceDialogOpen={setIsMaintenanceDialogOpen}
        onCleaningTaskCreate={handleCleaningTaskCreate}
        onMaintenanceTaskCreate={handleMaintenanceTaskCreate}
      />
      
      {/* Tabs for Today's Agenda and Quick Actions */}
      <Tabs defaultValue="today" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="today" className="flex items-center gap-2 py-2.5">
            <CalendarClock className="h-4 w-4" />
            <span>Today</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2 py-2.5">
            <Calendar className="h-4 w-4" />
            <span>Actions</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Show swipe indicators with improved visibility */}
        <div className="relative">
          {selectedTab === "today" && (
            <SwipeIndicator 
              direction="left" 
              visible={showSwipeHint}
              className="top-[50%] -translate-y-1/2 right-0"
              size="md"
              variant="solid" 
            />
          )}
          {selectedTab === "actions" && (
            <SwipeIndicator 
              direction="right" 
              visible={showSwipeHint}
              className="top-[50%] -translate-y-1/2 left-0"
              size="md"
              variant="solid" 
            />
          )}
        </div>
        
        <TabsContent value="today" className="mt-4">
          <DailyAgenda 
            housekeepingTasks={dashboardData.housekeepingTasks || []}
            maintenanceTasks={dashboardData.maintenanceTasks || []}
            onRefresh={handleRefresh}
          />
        </TabsContent>
        
        <TabsContent value="actions" className="mt-4">
          <MobileDashboardActions 
            onCreateCleaningTask={() => setIsCleaningDialogOpen(true)}
            onCreateMaintenanceTask={() => setIsMaintenanceDialogOpen(true)}
            navigate={navigate}
          />
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      {/* Offline Indicator and Sync Button */}
      <Card className="bg-muted">
        <CardContent className="p-3 text-center space-y-1">
          <p className="text-sm font-medium">All data synced</p>
          <p className="text-xs text-muted-foreground">You're good to go!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileDashboard;
