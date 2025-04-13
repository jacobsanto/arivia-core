
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklySummaryCardProps {
  weekOverWeekData: {
    occupancy: { current: number; previous: number; change: number };
    revenue: { current: number; previous: number; change: number };
    taskCompletion: { current: number; previous: number; change: number };
    maintenanceIssues: { current: number; previous: number; change: number };
  };
}

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({ weekOverWeekData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This week showed {weekOverWeekData.occupancy.change > 0 ? "an increase" : "a decrease"} in occupancy 
          compared to last week, with {weekOverWeekData.occupancy.current} occupied units. Revenue 
          {weekOverWeekData.revenue.change > 0 ? " increased by " : " decreased by "}
          {Math.abs(weekOverWeekData.revenue.change)}%, resulting in €{weekOverWeekData.revenue.current} for the week.
          Task completion rate {weekOverWeekData.taskCompletion.change > 0 ? "improved" : "declined"} 
          with {weekOverWeekData.taskCompletion.current} completed tasks. Maintenance issues 
          {weekOverWeekData.maintenanceIssues.change < 0 ? " decreased" : " increased"} 
          to {weekOverWeekData.maintenanceIssues.current} active issues.
        </p>
      </CardContent>
    </Card>
  );
};
