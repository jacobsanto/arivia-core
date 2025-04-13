
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardMetrics from "./DashboardMetrics";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, CalendarClock, CalendarDays, Wrench, Package, PieChart, BedDouble, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import DailyAgenda from "./DailyAgenda";
import { initialTasks as initialHousekeepingTasks } from "@/data/taskData";
import { initialTasks as initialMaintenanceTasks } from "@/data/maintenanceTasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwipe } from "@/hooks/use-swipe";
import { SwipeIndicator } from "@/components/ui/swipe-indicator";
import { toast } from "sonner";
import TaskCreationDialogs from "./TaskCreationDialogs";
import { useTasks } from "@/hooks/useTasks";
import { useMaintenanceTasks } from "@/hooks/useMaintenanceTasks";

interface MobileDashboardProps {
  dashboardData: any;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ dashboardData }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("today");
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  
  // Task creation dialog states
  const [isCleaningDialogOpen, setIsCleaningDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  
  // Get task handlers from hooks
  const { handleCreateTask: handleCleaningTaskCreate } = useTasks();
  const { handleCreateTask: handleMaintenanceTaskCreate } = useMaintenanceTasks();
  
  // Get upcoming tasks, limited to 3 for mobile view
  const upcomingTasks = dashboardData.upcomingTasks?.slice(0, 3) || [];
  
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
          <TabsTrigger value="today" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>Today</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
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
            housekeepingTasks={initialHousekeepingTasks}
            maintenanceTasks={initialMaintenanceTasks}
          />
        </TabsContent>
        
        <TabsContent value="actions" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Quick access buttons */}
            <Button 
              variant="outline" 
              className="border-dashed border-2 h-20 flex flex-col items-center justify-center gap-1"
              onClick={() => navigate('/housekeeping')}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs">View Tasks</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-dashed border-2 h-20 flex flex-col items-center justify-center gap-1"
              onClick={() => navigate('/maintenance')}
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-xs">Maintenance</span>
            </Button>
            
            {/* New task creation buttons */}
            <Button 
              variant="outline" 
              className="border-dashed border-2 h-20 flex flex-col items-center justify-center gap-1"
              onClick={() => setIsCleaningDialogOpen(true)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <BedDouble className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs">New Cleaning Task</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-dashed border-2 h-20 flex flex-col items-center justify-center gap-1"
              onClick={() => setIsMaintenanceDialogOpen(true)}
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-xs">New Maintenance Task</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-dashed border-2 h-20 flex flex-col items-center justify-center gap-1"
              onClick={() => navigate('/inventory')}
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs">Inventory</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-dashed border-2 h-20 flex flex-col items-center justify-center gap-1"
              onClick={() => navigate('/reports')}
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-xs">Reports</span>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      {/* Offline Indicator and Sync Button */}
      <div className="bg-muted p-3 rounded-md text-center space-y-1">
        <p className="text-sm font-medium">All data synced</p>
        <p className="text-xs text-muted-foreground">You're good to go!</p>
      </div>
    </div>
  );
};

export default MobileDashboard;
