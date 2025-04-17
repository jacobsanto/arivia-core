
import React, { useState, useEffect } from 'react';
import { useReports } from '@/hooks/useReports';
import { toastService } from "@/services/toast/toast.service";
import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { ReportsFilters } from '@/components/reports/ReportsFilters';
import { ReportingContent } from '@/components/reports/ReportingContent';
import { AnalyticsContent } from '@/components/reports/AnalyticsContent';
import { useIsMobile } from "@/hooks/use-mobile";
import MobileReports from '@/components/reports/MobileReports';
import { DateRange } from '@/components/reports/DateRangeSelector';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, WifiOff } from "lucide-react";

const Reports = () => {
  // Initialize the reports hook for task reports
  const { reports, isLoading, loadReports, networkError } = useReports('task');
  const [activeView, setActiveView] = useState('reporting'); // reporting, analytics
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load reports when the component mounts
    loadReports();
    
    // Add event listeners for online/offline status
    const handleOnline = () => {
      console.log("App is online, reloading reports");
      loadReports();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleCreateReport = () => {
    // Switch to reports tab and trigger new report dialog
    setActiveView('reporting');
    
    // Cast the Element to HTMLElement to use the click method
    const element = document.querySelector('[data-value="scheduled-reports"]');
    if (element) {
      (element as HTMLElement).click();
    }
    
    // The scheduled reports component will handle showing the dialog
    toastService.info("Create Report", {
      description: "Select your report type and configure settings."
    });
  };

  // Render network error alert
  const renderNetworkError = () => {
    if (!networkError) return null;
    
    return (
      <Alert variant="destructive" className="mb-6">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>Network connection issue</AlertTitle>
        <AlertDescription>
          Unable to load reports due to connectivity issues. Please check your internet connection and try again.
        </AlertDescription>
      </Alert>
    );
  };

  // Render mobile UI
  if (isMobile) {
    return (
      <AnalyticsProvider>
        <div className="container max-w-7xl mx-auto p-2">
          {renderNetworkError()}
          <MobileReports 
            dateRange={dateRange}
            setDateRange={setDateRange}
            reports={reports}
            isLoading={isLoading}
          />
        </div>
      </AnalyticsProvider>
    );
  }

  // Desktop UI
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="container max-w-7xl mx-auto p-2 md:p-4 space-y-6">
        {renderNetworkError()}
        <ReportsHeader 
          activeView={activeView}
          setActiveView={setActiveView}
          onCreateReport={handleCreateReport}
        />
        
        <div className="w-full overflow-hidden">
          <ReportsFilters 
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </div>
        
        <AnalyticsProvider>
          {activeView === 'reporting' ? (
            <div className="overflow-hidden">
              <ReportingContent 
                reportsCount={reports.length} 
                isLoading={isLoading} 
              />
            </div>
          ) : (
            <div className="overflow-hidden">
              <AnalyticsContent />
            </div>
          )}
        </AnalyticsProvider>
      </div>
    </div>
  );
};

export default Reports;
