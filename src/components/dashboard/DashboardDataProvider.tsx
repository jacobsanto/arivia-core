
import React, { createContext, useContext } from 'react';
import { useDashboard } from '@/hooks/useDashboard';

interface DashboardContextType {
  data: any;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastRefresh: Date;
  refreshStatus: {
    lastRefresh: Date;
    isRefreshing: boolean;
    nextRefresh: Date;
  };
  // Legacy properties for backward compatibility
  dashboardData: any;
  handlePropertyChange: (property: string) => void;
  handleDateRangeChange: (range: any) => void;
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dashboardHook = useDashboard();

  const value: DashboardContextType = {
    ...dashboardHook,
    // Legacy properties for backward compatibility
    dashboardData: dashboardHook.data,
    handlePropertyChange: (property: string) => {
      console.log('Property change:', property);
      // Implement property filtering if needed
    },
    handleDateRangeChange: (range: any) => {
      console.log('Date range change:', range);
      // Implement date range filtering if needed
    },
    refreshDashboard: dashboardHook.refresh
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardDataProvider');
  }
  return context;
};
