
import React, { useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import { format } from 'date-fns';
import { 
  exportDashboardData, 
  refreshDashboardData,
  generateWeeklyReview,
  getRefreshStatus
} from "@/utils/dashboard";

// Import refactored components
import DashboardHeading from "./header/DashboardHeading";
import FilterBadges from "./header/FilterBadges";
import ActionButtons from "./header/ActionButtons";
import MobileActionButtons from "./header/MobileActionButtons";
import DashboardFilters from "./header/DashboardFilters";
import { WeeklyReviewDialog } from "./weekly-review";
import { ExportConfigDialog, ExportFormat, ExportSection } from "./ExportConfigDialog";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeaderProps {
  selectedProperty: string;
  onPropertyChange: (property: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  refreshDashboardContent: () => void;
  dashboardData: any;
  isLoading?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedProperty,
  onPropertyChange,
  dateRange,
  onDateRangeChange,
  refreshDashboardContent,
  dashboardData,
  isLoading = false
}) => {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const isSuperAdmin = user?.role === "superadmin";
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showExportConfig, setShowExportConfig] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { lastRefresh } = getRefreshStatus();
  const lastRefreshTime = format(lastRefresh, 'HH:mm:ss');

  const handleExport = async (format: ExportFormat, sections: ExportSection[]) => {
    setIsExporting(true);
    try {
      await exportDashboardData(dashboardData, selectedProperty, format, sections);
    } finally {
      setIsExporting(false);
      setShowExportConfig(false);
    }
  };

  const handleRefreshData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Wrap the function in a Promise if it doesn't return one
      await refreshDashboardData(async () => {
        refreshDashboardContent();
        return Promise.resolve({});
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleWeeklyReview = () => {
    if (generateWeeklyReview(dashboardData, selectedProperty)) {
      setShowWeeklyReview(true);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <DashboardHeading lastRefreshTime={lastRefreshTime} />
          
          {isSuperAdmin && !isMobile && (
            <ActionButtons
              isExporting={isExporting}
              isRefreshing={isRefreshing || isLoading}
              onExportClick={() => setShowExportConfig(true)}
              onRefreshClick={handleRefreshData}
              onWeeklyReviewClick={handleWeeklyReview}
              disabled={isLoading}
            />
          )}
        </div>
        
        {!isMobile && (
          <FilterBadges
            selectedProperty={selectedProperty}
            dateRange={dateRange}
          />
        )}
      </div>
      
      {isLoading ? (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Skeleton className="h-10 w-full sm:w-1/2" />
          <Skeleton className="h-10 w-full sm:w-1/2" />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <DashboardFilters
            selectedProperty={selectedProperty}
            onPropertyChange={onPropertyChange}
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
          />
          
          {isMobile && isSuperAdmin && (
            <MobileActionButtons
              isExporting={isExporting}
              isRefreshing={isRefreshing}
              onExportClick={() => setShowExportConfig(true)}
              onRefreshClick={handleRefreshData}
            />
          )}
        </div>
      )}

      {/* Weekly Review Dialog */}
      <WeeklyReviewDialog
        open={showWeeklyReview}
        onOpenChange={setShowWeeklyReview}
        propertyFilter={selectedProperty}
        dashboardData={dashboardData}
      />
      
      {/* Export Configuration Dialog */}
      <ExportConfigDialog
        open={showExportConfig}
        onOpenChange={setShowExportConfig}
        onExport={handleExport}
        isExporting={isExporting}
        propertyFilter={selectedProperty}
      />
    </div>
  );
};

export default DashboardHeader;
