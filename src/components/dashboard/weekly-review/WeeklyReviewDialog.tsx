
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import { toastService } from "@/services/toast/toast.service";

import WeeklyReviewTabs from "./WeeklyReviewTabs";
import WeeklyReviewActions from "./WeeklyReviewActions";

interface WeeklyReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyFilter: string;
  dashboardData: any;
}

export const WeeklyReviewDialog: React.FC<WeeklyReviewDialogProps> = ({
  open,
  onOpenChange,
  propertyFilter,
  dashboardData
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSchedulingReport, setIsSchedulingReport] = useState(false);
  
  // Generate dates for the weekly review
  const today = new Date();
  const startOfWeek = subDays(today, 6);
  const dateRange = `${format(startOfWeek, 'MMM d')} - ${format(today, 'MMM d, yyyy')}`;

  // Prepare week-over-week comparison (simplified for demo)
  const weekOverWeekData = {
    occupancy: {
      current: dashboardData.properties?.occupied || 0,
      previous: Math.max(0, (dashboardData.properties?.occupied || 0) - 1),
      change: 1,
    },
    revenue: {
      current: 4250,
      previous: 3800,
      change: 11.8,
    },
    taskCompletion: {
      current: dashboardData.tasks?.completed || 0,
      previous: Math.floor((dashboardData.tasks?.completed || 0) * 0.9),
      change: 10,
    },
    maintenanceIssues: {
      current: dashboardData.maintenance?.total || 0,
      previous: Math.ceil((dashboardData.maintenance?.total || 0) * 1.2),
      change: -20,
    }
  };
  
  // Prepare data for export
  const prepareWeeklyReportData = () => {
    const data = [
      { Metric: 'Date Range', Value: dateRange },
      { Metric: 'Property', Value: propertyFilter === 'all' ? 'All Properties' : propertyFilter },
      { Metric: 'Current Occupancy', Value: `${weekOverWeekData.occupancy.current} units` },
      { Metric: 'Previous Week Occupancy', Value: `${weekOverWeekData.occupancy.previous} units` },
      { Metric: 'Occupancy Change', Value: `${weekOverWeekData.occupancy.change}%` },
      { Metric: 'Current Revenue', Value: `€${weekOverWeekData.revenue.current}` },
      { Metric: 'Previous Week Revenue', Value: `€${weekOverWeekData.revenue.previous}` },
      { Metric: 'Revenue Change', Value: `${weekOverWeekData.revenue.change}%` },
      { Metric: 'Tasks Completed', Value: dashboardData.tasks?.completed || 0 },
      { Metric: 'Tasks Pending', Value: dashboardData.tasks?.pending || 0 },
      { Metric: 'Critical Maintenance Issues', Value: dashboardData.maintenance?.critical || 0 },
    ];
    
    // Add upcoming tasks if available
    if (dashboardData.upcomingTasks && dashboardData.upcomingTasks.length) {
      dashboardData.upcomingTasks.forEach((task: any, index: number) => {
        data.push({
          Metric: `Upcoming Task ${index + 1}`,
          Value: `${task.title} - Due: ${task.dueDate}`
        });
      });
    }
    
    return data;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Weekly Performance Review
          </DialogTitle>
          <DialogDescription>
            Performance overview for {propertyFilter === 'all' ? 'all properties' : propertyFilter} during {dateRange}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto">
          <WeeklyReviewTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            weekOverWeekData={weekOverWeekData}
            dateRange={dateRange}
            dashboardData={dashboardData}
          />
        </div>

        <DialogFooter className="flex flex-wrap items-center gap-2 border-t pt-4 mt-4">
          <WeeklyReviewActions 
            isGeneratingReport={isGeneratingReport}
            setIsGeneratingReport={setIsGeneratingReport}
            isSchedulingReport={isSchedulingReport}
            setIsSchedulingReport={setIsSchedulingReport}
            prepareWeeklyReportData={prepareWeeklyReportData}
            propertyFilter={propertyFilter}
            onClose={() => onOpenChange(false)} 
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyReviewDialog;
