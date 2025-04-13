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
import WeeklyReviewDialog from "./WeeklyReviewDialog";
import { ExportConfigDialog, ExportFormat, ExportSection } from "./ExportConfigDialog";
import { DateRange } from "@/components/reports/DateRangeSelector";

interface DashboardHeaderProps {
  selectedProperty: string;
  onPropertyChange: (property: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  refreshDashboardContent: () => void;
  dashboardData: any;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedProperty,
  onPropertyChange,
  dateRange,
  onDateRangeChange,
  refreshDashboardContent,
  dashboardData
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
      await refreshDashboardData(refreshDashboardContent);
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
              isRefreshing={isRefreshing}
              onExportClick={() => setShowExportConfig(true)}
              onRefreshClick={handleRefreshData}
              onWeeklyReviewClick={handleWeeklyReview}
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
