
import React, { createContext, useContext, ReactNode } from 'react';
import { useDashboard } from "@/hooks/useDashboard";
import { useDashboardPreferences } from "@/hooks/useDashboardPreferences";
import { DateRange } from "@/components/reports/DateRangeSelector";

interface DashboardContextType {
  dashboardData: any;
  isLoading: boolean;
  error: string | null;
  preferences: any;
  isSaving: boolean;
  lastSaved: Date | null;
  selectedProperty: string;
  dateRange: DateRange;
  handlePropertyChange: (property: string) => void;
  handleDateRangeChange: (range: DateRange) => void;
  handleRefresh: () => Promise<any>;
  toggleFavoriteMetric: (metricId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardDataProvider');
  }
  return context;
};

interface DashboardDataProviderProps {
  children: ReactNode;
}

export const DashboardDataProvider: React.FC<DashboardDataProviderProps> = ({ children }) => {
  const {
    dashboardData,
    handlePropertyChange: handlePropertyChangeCore,
    handleDateRangeChange: handleDateRangeCore,
    refreshDashboard,
    isLoading,
    error
  } = useDashboard();
  
  const { 
    preferences,
    isSaving,
    lastSaved,
    updateSelectedProperty,
    updateDateRange,
    toggleFavoriteMetric
  } = useDashboardPreferences();

  // Convert stored preferences date range for dashboard
  const convertedDateRange: DateRange = React.useMemo(() => {
    return {
      from: preferences.dateRange.from ? new Date(preferences.dateRange.from) : undefined,
      to: preferences.dateRange.to ? new Date(preferences.dateRange.to) : undefined
    };
  }, [preferences.dateRange]);

  // Handle property change with preference saving
  const handlePropertyChange = React.useCallback((property: string) => {
    console.log(`Changing selected property to: ${property}`);
    updateSelectedProperty(property);
    handlePropertyChangeCore(property);
  }, [updateSelectedProperty, handlePropertyChangeCore]);

  // Handle date range change with preference saving
  const handleDateRangeChange = React.useCallback((range: DateRange) => {
    console.log(`Updating date range to: ${range.from?.toISOString()} - ${range.to?.toISOString()}`);
    updateDateRange(range);
    handleDateRangeCore(range);
  }, [updateDateRange, handleDateRangeCore]);

  // Optimize refresh callback
  const handleRefresh = React.useCallback(() => {
    console.log("Manual dashboard refresh triggered");
    return refreshDashboard();
  }, [refreshDashboard]);

  const value: DashboardContextType = {
    dashboardData,
    isLoading,
    error,
    preferences,
    isSaving,
    lastSaved,
    selectedProperty: preferences.selectedProperty,
    dateRange: convertedDateRange,
    handlePropertyChange,
    handleDateRangeChange,
    handleRefresh,
    toggleFavoriteMetric
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
