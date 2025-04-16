
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TimeFilter } from '@/utils/dateRangeUtils';

export type PropertyFilter = 'all' | 'Villa Caldera' | 'Villa Sunset' | 'Villa Oceana' | 'Villa Paradiso' | 'Villa Azure';
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
  isLoading: boolean;
  refreshData: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedProperty, setSelectedProperty] = useState<PropertyFilter>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [dateRange, setDateRange] = useState<{ from?: Date, to?: Date }>({});
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>('month');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
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
