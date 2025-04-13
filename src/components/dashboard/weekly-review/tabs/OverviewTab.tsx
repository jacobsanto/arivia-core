
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyMetricCard } from "../components/WeeklyMetricCard";
import { WeeklySummaryCard } from "../components/WeeklySummaryCard";

interface OverviewTabProps {
  weekOverWeekData: any;
  dateRange: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ weekOverWeekData, dateRange }) => {
  return (
    <TabsContent value="overview" className="space-y-5 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Week-over-Week Performance</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
          {dateRange}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyMetricCard 
          title="Occupancy"
          description="Week-over-week change"
          current={`${weekOverWeekData.occupancy.current} units`}
          previous={`${weekOverWeekData.occupancy.previous} units`}
          change={weekOverWeekData.occupancy.change}
          isPositive={true}
        />

        <WeeklyMetricCard 
          title="Revenue"
          description="Week-over-week change"
          current={`€${weekOverWeekData.revenue.current}`}
          previous={`€${weekOverWeekData.revenue.previous}`}
          change={weekOverWeekData.revenue.change}
          isPositive={true}
        />

        <WeeklyMetricCard 
          title="Task Completion Rate"
          description="Week-over-week change"
          current={`${weekOverWeekData.taskCompletion.current} tasks`}
          previous={`${weekOverWeekData.taskCompletion.previous} tasks`}
          change={weekOverWeekData.taskCompletion.change}
          isPositive={true}
        />

        <WeeklyMetricCard 
          title="Maintenance Issues"
          description="Week-over-week change"
          current={`${weekOverWeekData.maintenanceIssues.current} issues`}
          previous={`${weekOverWeekData.maintenanceIssues.previous} issues`}
          change={weekOverWeekData.maintenanceIssues.change}
          isPositive={false}
        />
      </div>

      <WeeklySummaryCard weekOverWeekData={weekOverWeekData} />
    </TabsContent>
  );
};

export default OverviewTab;
