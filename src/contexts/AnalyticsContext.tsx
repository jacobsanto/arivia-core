
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from '@/components/reports/DateRangeSelector';
import { addMonths, subMonths } from 'date-fns';

export type PropertyFilter = 'all' | 'Villa Caldera' | 'Villa Sunset' | 'Villa Oceana' | 'Villa Paradiso' | 'Villa Azure';
export type TimeRangeFilter = 'week' | 'month' | 'quarter' | 'year' | 'custom';

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
  // Default to current date minus 30 days
  const today = new Date();
  const defaultDateRange: DateRange = {
    from: subMonths(today, 1),
    to: today
  };

  const [selectedProperty, setSelectedProperty] = useState<PropertyFilter>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>('month');
  const [isLoading] = useState<boolean>(false);

  const value = {
    selectedProperty,
    setSelectedProperty,
    selectedYear,
    setSelectedYear,
    dateRange,
    setDateRange,
    timeRangeFilter,
    setTimeRangeFilter,
    isLoading
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
