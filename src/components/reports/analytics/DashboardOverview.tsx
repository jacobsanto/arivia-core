
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnalytics } from '@/contexts/AnalyticsContext';

export const DashboardOverview: React.FC = () => {
  const isMobile = useIsMobile();
  const { selectedProperty } = useAnalytics();
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Executive Dashboard</CardTitle>
          <CardDescription>
            {selectedProperty === 'all' 
              ? 'A comprehensive overview of key performance metrics across all operations'
              : `Key performance metrics for ${selectedProperty}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pb-6">
          <AnalyticsDashboard 
            showAllCharts={!isMobile} 
            showMonitoring={true} 
            propertyFilter={selectedProperty}
          />
        </CardContent>
      </Card>
    </div>
  );
};
