
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DateRange } from '@/components/reports/DateRangeSelector';
import { addMonths, subMonths } from 'date-fns';
import { getDateRangeForTimeFilter } from '@/utils/dateRangeUtils';

export type PropertyFilter = 'all' | 'Villa Caldera' | 'Villa Sunset' | 'Villa Oceana' | 'Villa Paradiso' | 'Villa Azure';
export type TimeRangeFilter = 'week' | 'month' | 'quarter' | 'year' | 'custom' | 'last7' | 'last30' | 'last90' | 'last12months';

interface AnalyticsContextType {
  selectedProperty: PropertyFilter;
  setSelectedProperty: (property: PropertyFilter) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  timeRangeFilter: TimeRangeFilter;
  setTimeRangeFilter: (range: TimeRangeFilter) => void;
  isLoading: boolean;
  refreshData: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // Default to current month
  const initialDateRange = getDateRangeForTimeFilter('month');

  const [selectedProperty, setSelectedProperty] = useState<PropertyFilter>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>('month');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Update date range when time range filter changes
  useEffect(() => {
    if (timeRangeFilter !== 'custom') {
      const newDateRange = getDateRangeForTimeFilter(timeRangeFilter);
      setDateRange(newDateRange);
    }
  }, [timeRangeFilter]);

  // Function to refresh data
  const refreshData = () => {
    setIsLoading(true);
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const value = {
    selectedProperty,
    setSelectedProperty,
    selectedYear,
    setSelectedYear,
    dateRange,
    setDateRange,
    timeRangeFilter,
    setTimeRangeFilter,
    isLoading,
    refreshData
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
