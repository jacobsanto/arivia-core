
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TimeFilter } from '@/utils/dateRangeUtils';
import { analyticsService } from '@/services/analytics/analytics.service';
import { getDateRangeForTimeFilter } from '@/utils/dateRangeUtils';

export type PropertyFilter = 'all' | string;
export type TimeRangeFilter = TimeFilter;

interface AnalyticsContextType {
  selectedProperty: PropertyFilter;
  setSelectedProperty: (property: PropertyFilter) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  dateRange: { from?: Date, to?: Date };
  setDateRange: (range: { from?: Date, to?: Date }) => void;
  timeRangeFilter: TimeRangeFilter;
  setTimeRangeFilter: (filter: TimeRangeFilter) => void;
  financialData: any[];
  occupancyData: any[];
  propertiesList: string[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedProperty, setSelectedProperty] = useState<PropertyFilter>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [dateRange, setDateRange] = useState<{ from?: Date, to?: Date }>(getDateRangeForTimeFilter('month'));
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>('month');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [propertiesList, setPropertiesList] = useState<string[]>([]);
  
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [financialReports, occupancyReports, properties] = await Promise.all([
        analyticsService.getFinancialReports(dateRange),
        analyticsService.getOccupancyReports(dateRange),
        analyticsService.getPropertiesList()
      ]);
      
      // Set data
      setFinancialData(financialReports);
      setOccupancyData(occupancyReports);
      setPropertiesList(properties);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);
  
  // Initial data load
  React.useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Update date range when time filter changes
  React.useEffect(() => {
    if (timeRangeFilter !== 'custom') {
      setDateRange(getDateRangeForTimeFilter(timeRangeFilter));
    }
  }, [timeRangeFilter]);
  
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);
  
  return (
    <AnalyticsContext.Provider value={{
      selectedProperty,
      setSelectedProperty,
      selectedYear,
      setSelectedYear,
      dateRange,
      setDateRange,
      timeRangeFilter,
      setTimeRangeFilter,
      financialData,
      occupancyData,
      propertiesList,
      isLoading,
      refreshData
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
