
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportStatisticsProps {
  activeReportsCount: number;
  reportsSentCount?: number;
  deliveryRate?: string;
}

export const ReportStatistics: React.FC<ReportStatisticsProps> = ({
  activeReportsCount,
  reportsSentCount = 24,
  deliveryRate = "98%",
}) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Report Delivery Statistics</CardTitle>
        <CardDescription>Summary of report deliveries in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-3xl font-bold">{activeReportsCount}</div>
            <div className="text-sm text-muted-foreground">Active Reports</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-3xl font-bold">{reportsSentCount}</div>
            <div className="text-sm text-muted-foreground">Reports Sent</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-3xl font-bold">{deliveryRate}</div>
            <div className="text-sm text-muted-foreground">Delivery Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
