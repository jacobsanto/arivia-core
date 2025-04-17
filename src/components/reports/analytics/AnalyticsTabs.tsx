
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';
import { PropertySelector } from '@/components/reports/PropertySelector';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { DashboardOverview } from './DashboardOverview';
import { FinancialReports } from './FinancialReports';
import { OccupancyReports } from './OccupancyReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const AnalyticsTabs: React.FC = () => {
  const { 
    selectedProperty, 
    setSelectedProperty, 
    dateRange, 
    setDateRange,
    timeRangeFilter,
    setTimeRangeFilter,
    propertiesList,
    refreshData,
    isLoading
  } = useAnalytics();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="md:flex items-center space-x-4">
          <PropertySelector 
            properties={propertiesList}
            selectedProperty={selectedProperty}
            onPropertyChange={setSelectedProperty}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <DateRangeSelector 
            value={dateRange} 
            onChange={setDateRange}
            timeFilter={timeRangeFilter}
            onTimeFilterChange={setTimeRangeFilter}
          />
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <DashboardOverview />
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6">
          <FinancialReports />
        </TabsContent>
        
        <TabsContent value="occupancy" className="space-y-6">
          <OccupancyReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};
