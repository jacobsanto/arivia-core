
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

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
import { toastService } from "@/services/toast";

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
  const [error, setError] = useState<string | null>(null);
  
  const { lastRefresh } = getRefreshStatus();
  const lastRefreshTime = format(lastRefresh, 'HH:mm:ss');

  const handleExport = async (format: ExportFormat, sections: ExportSection[]) => {
    setIsExporting(true);
    setError(null);
    
    try {
      await exportDashboardData(dashboardData, selectedProperty, format, sections);
      toastService.success("Dashboard exported successfully", {
        description: `Your ${format.toUpperCase()} export is ready to download`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Export failed: ${errorMessage}`);
      toastService.error("Export failed", {
        description: "There was a problem generating your export"
      });
    } finally {
      setIsExporting(false);
      setShowExportConfig(false);
    }
  };

  const handleRefreshData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Wrap the function in a Promise if it doesn't return one
      await refreshDashboardData(async () => {
        try {
          await refreshDashboardContent();
          return Promise.resolve({});
        } catch (error) {
          throw error;
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Refresh failed: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleWeeklyReview = () => {
    try {
      if (generateWeeklyReview(dashboardData, selectedProperty)) {
        setShowWeeklyReview(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to generate weekly review: ${errorMessage}`);
      toastService.error("Weekly review failed", {
        description: "Could not generate weekly review data"
      });
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
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-xs underline flex items-center gap-1"
              aria-label="Dismiss error"
            >
              <ExternalLink className="h-3 w-3" />
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}
      
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
