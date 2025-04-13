
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./tabs/OverviewTab";
import TasksTab from "./tabs/TasksTab";
import BookingsTab from "./tabs/BookingsTab";
import SystemTab from "./tabs/SystemTab";

interface WeeklyReviewTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  weekOverWeekData: any;
  dateRange: string;
  dashboardData: any;
}

const WeeklyReviewTabs: React.FC<WeeklyReviewTabsProps> = ({
  activeTab,
  setActiveTab,
  weekOverWeekData,
  dateRange,
  dashboardData
}) => {
  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks">Tasks & Maintenance</TabsTrigger>
        <TabsTrigger value="bookings">Bookings & Revenue</TabsTrigger>
        <TabsTrigger value="system">System Events</TabsTrigger>
      </TabsList>
      
      <OverviewTab 
        weekOverWeekData={weekOverWeekData} 
        dateRange={dateRange} 
      />
      
      <TasksTab 
        dashboardData={dashboardData} 
      />
      
      <BookingsTab 
        weekOverWeekData={weekOverWeekData} 
      />
      
      <SystemTab />
    </Tabs>
  );
};

export default WeeklyReviewTabs;
