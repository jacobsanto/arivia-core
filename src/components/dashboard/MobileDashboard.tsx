
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardMetrics from "./DashboardMetrics";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, CalendarClock, CalendarDays, Tool, Package, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import DailyAgenda from "./DailyAgenda";
import { initialTasks as initialHousekeepingTasks } from "@/data/taskData";
import { initialTasks as initialMaintenanceTasks } from "@/data/maintenanceTasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwipe } from "@/hooks/use-swipe";

interface MobileDashboardProps {
  dashboardData: any;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ dashboardData }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("today");
  
  // Get upcoming tasks, limited to 3 for mobile view
  const upcomingTasks = dashboardData.upcomingTasks?.slice(0, 3) || [];
  
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: () => {
      if (selectedTab === "today") setSelectedTab("actions");
    },
    onSwipeRight: () => {
      if (selectedTab === "actions") setSelectedTab("today");
    }
  });

  return (
    <div 
      className="space-y-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Stats Cards */}
      <DashboardMetrics data={dashboardData} />
      
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
        
        <TabsContent value="today" className="mt-4">
          <DailyAgenda 
            housekeepingTasks={initialHousekeepingTasks}
            maintenanceTasks={initialMaintenanceTasks}
          />
        </TabsContent>
        
        <TabsContent value="actions" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
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
                <Tool className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-xs">Maintenance</span>
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
