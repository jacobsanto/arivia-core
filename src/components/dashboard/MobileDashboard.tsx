
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardMetrics from "./DashboardMetrics";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, CalendarClock, Menu, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import DailyAgenda from "./DailyAgenda";
import { initialTasks as initialHousekeepingTasks } from "@/data/taskData";
import { initialTasks as initialMaintenanceTasks } from "@/data/maintenanceTasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwipeableCard } from "@/components/ui/swipeable-card";

interface MobileDashboardProps {
  dashboardData: any;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ dashboardData }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("today");
  
  // Get upcoming tasks, limited to 3 for mobile view
  const upcomingTasks = dashboardData.upcomingTasks?.slice(0, 3) || [];
  
  const handleQuickAction = (route: string) => {
    navigate(route);
  };
  
  return (
    <div className="space-y-3">
      {/* Stats Cards - more compact */}
      <DashboardMetrics data={dashboardData} />
      
      {/* Tabs for Today's Agenda and Quick Actions */}
      <Tabs defaultValue="today" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="today" className="flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Today</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-1">
            <Menu className="h-3.5 w-3.5" />
            <span>Quick Actions</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-3">
          <DailyAgenda 
            housekeepingTasks={initialHousekeepingTasks}
            maintenanceTasks={initialMaintenanceTasks}
          />
        </TabsContent>
        
        <TabsContent value="actions" className="mt-3">
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              icon={<CheckSquare className="h-5 w-5 text-blue-600" />}
              label="Tasks"
              bgColor="bg-blue-100"
              onClick={() => handleQuickAction('/housekeeping')}
            />
            
            <ActionButton
              icon={<Calendar className="h-5 w-5 text-amber-600" />}
              label="Maintenance"
              bgColor="bg-amber-100"
              onClick={() => handleQuickAction('/maintenance')}
            />
            
            <ActionButton
              icon={<Calendar className="h-5 w-5 text-green-600" />}
              label="Inventory"
              bgColor="bg-green-100"
              onClick={() => handleQuickAction('/inventory')}
            />
            
            <ActionButton
              icon={<Calendar className="h-5 w-5 text-purple-600" />}
              label="Reports"
              bgColor="bg-purple-100"
              onClick={() => handleQuickAction('/reports')}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Offline Indicator - simplified */}
      <div className="bg-muted p-2 rounded-md text-center">
        <p className="text-xs font-medium">All data synced</p>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, bgColor, onClick }) => {
  return (
    <SwipeableCard
      className="h-20 flex flex-col items-center justify-center gap-1 p-0 hover:bg-muted/50 active:bg-muted cursor-pointer"
      onClick={onClick}
      swipeEnabled={false}
    >
      <div className={`w-9 h-9 rounded-full ${bgColor} flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </SwipeableCard>
  );
};

export default MobileDashboard;
