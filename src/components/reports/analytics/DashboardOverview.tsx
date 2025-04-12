
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useIsMobile } from "@/hooks/use-mobile";

export const DashboardOverview: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Executive Dashboard</CardTitle>
          <CardDescription>A comprehensive overview of key performance metrics across all operations</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <AnalyticsDashboard showAllCharts={!isMobile} showMonitoring={true} />
        </CardContent>
      </Card>
    </div>
  );
};
