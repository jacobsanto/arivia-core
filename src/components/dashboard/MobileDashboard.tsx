
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardMetrics from "./DashboardMetrics";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, CalendarClock, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import DailyAgenda from "./DailyAgenda";
import { initialTasks as initialHousekeepingTasks } from "@/data/taskData";
import { initialTasks as initialMaintenanceTasks } from "@/data/maintenanceTasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MobileDashboardProps {
  dashboardData: any;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ dashboardData }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("today");
  
  // Get upcoming tasks, limited to 3 for mobile view
  const upcomingTasks = dashboardData.upcomingTasks?.slice(0, 3) || [];
  
  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <DashboardMetrics data={dashboardData} />
      
      {/* Tabs for Today's Agenda and Quick Actions */}
      <Tabs defaultValue="today" className="w-full" onValueChange={setSelectedTab}>
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
              className="border-dashed border-2 h-24 flex flex-col items-center justify-center gap-1"
              onClick={() => navigate('/housekeeping')}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-condensed">View Tasks</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-dashed border-2 h-24 flex flex-col items-center justify-center gap-1"
              onClick={() => navigate('/maintenance')}
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-sm font-condensed">Maintenance</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-dashed border-2 h-24 flex flex-col items-center justify-center gap-1"
              onClick={() => navigate('/inventory')}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-condensed">Inventory</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-dashed border-2 h-24 flex flex-col items-center justify-center gap-1"
              onClick={() => navigate('/reports')}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-condensed">Reports</span>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      {/* Offline Indicator and Sync Button */}
      <div className="bg-muted p-4 rounded-md text-center space-y-2">
        <p className="text-sm font-medium">All data synced</p>
        <p className="text-xs text-muted-foreground font-condensed">You're good to go!</p>
      </div>
    </div>
  );
};

export default MobileDashboard;
