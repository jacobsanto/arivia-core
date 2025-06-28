
import React, { useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { useDashboard } from "@/hooks/useDashboard";
import { useDashboardPreferences } from "@/hooks/useDashboardPreferences";
import { useIsMobile } from "@/hooks/use-mobile";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { populateSampleData } from "@/utils/sampleDataPopulator";
import DashboardContainer from "./DashboardContainer";

const DashboardPage: React.FC = () => {
  const {
    dashboardData,
    handlePropertyChange,
    handleDateRangeChange,
    refreshDashboard,
    isLoading,
    error,
    selectedProperty,
    dateRange
  } = useDashboard();
  
  const { 
    preferences,
    isSaving,
    lastSaved,
    updateSelectedProperty,
    updateDateRange,
    toggleFavoriteMetric
  } = useDashboardPreferences();
  
  const isMobile = useIsMobile();

  const handleRefresh = useCallback(() => {
    console.log("Manual dashboard refresh triggered");
    return refreshDashboard();
  }, [refreshDashboard]);

  const handleAddSampleData = useCallback(async () => {
    try {
      const result = await populateSampleData();
      if (result.success) {
        toast.success("Sample data added successfully", {
          description: "Dashboard will refresh automatically"
        });
        await handleRefresh();
      } else {
        toast.error("Failed to add sample data", {
          description: result.message
        });
      }
    } catch (error) {
      toast.error("Failed to add sample data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }, [handleRefresh]);

  const convertedDateRange: DateRange = useMemo(() => {
    return {
      from: preferences.dateRange.from ? new Date(preferences.dateRange.from) : undefined,
      to: preferences.dateRange.to ? new Date(preferences.dateRange.to) : undefined
    };
  }, [preferences.dateRange]);

  const handlePropertyChangeWithSave = useCallback((property: string) => {
    console.log(`Changing selected property to: ${property}`);
    updateSelectedProperty(property);
    handlePropertyChange(property);
  }, [updateSelectedProperty, handlePropertyChange]);

  const handleDateRangeChangeWithSave = useCallback((range: DateRange) => {
    console.log(`Updating date range to: ${range.from?.toISOString()} - ${range.to?.toISOString()}`);
    updateDateRange(range);
    handleDateRangeChange(range);
  }, [updateDateRange, handleDateRangeChange]);

  return (
    <>
      <Helmet>
        <title>Dashboard - Arivia Villas</title>
      </Helmet>
      <DashboardContainer
        selectedProperty={selectedProperty}
        onPropertyChange={handlePropertyChangeWithSave}
        dateRange={convertedDateRange}
        onDateRangeChange={handleDateRangeChangeWithSave}
        refreshDashboard={handleRefresh}
        dashboardData={dashboardData}
        isLoading={isLoading}
        error={error}
        isMobile={isMobile}
        preferences={preferences}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onToggleFavorite={toggleFavoriteMetric}
        onAddSampleData={handleAddSampleData}
      />
    </>
  );
};

export default DashboardPage;
