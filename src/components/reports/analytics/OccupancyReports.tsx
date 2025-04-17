
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { OccupancyRateChart } from './occupancy/OccupancyRateChart';
import { OccupancyMetricsCards } from './occupancy/OccupancyMetricsCards';
import { BookingsChart } from './occupancy/BookingsChart';
import { getOccupancyOverviewData, getBookingsChartData } from './occupancy/occupancyDataHelpers';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const OccupancyReports: React.FC = () => {
  const { selectedProperty, selectedYear, occupancyData, isLoading } = useAnalytics();
  
  // Get the overview title based on filters
  const getOccupancyOverviewTitle = () => {
    return selectedProperty === 'all' 
      ? "Occupancy Overview" 
      : `${selectedProperty} Occupancy Overview`;
  };

  // Get the overview description
  const getOccupancyOverviewDescription = () => {
    return selectedProperty === 'all'
      ? `Monthly occupancy rates for ${selectedYear}`
      : `Monthly occupancy rates for ${selectedProperty} in ${selectedYear}`;
  };
  
  const chartData = getOccupancyOverviewData(occupancyData, selectedProperty);
  const bookingsData = getBookingsChartData(occupancyData, selectedProperty);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {chartData.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{getOccupancyOverviewTitle()}</CardTitle>
            <CardDescription>{getOccupancyOverviewDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-muted/50">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No occupancy data available</AlertTitle>
              <AlertDescription>
                Occupancy data will appear here once it's recorded. Please select a different time period or add occupancy records.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <OccupancyRateChart 
          title={getOccupancyOverviewTitle()} 
          description={getOccupancyOverviewDescription()} 
          chartData={chartData} 
        />
      )}
      
      <OccupancyMetricsCards occupancyData={occupancyData} />

      <BookingsChart 
        chartData={bookingsData}
        propertyName={selectedProperty} 
      />
    </div>
  );
};
