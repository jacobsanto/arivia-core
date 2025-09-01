import React, { useState, useEffect } from 'react';
import { AnalyticsFiltersCard } from '@/components/analytics/AnalyticsFiltersCard';
import { KPIOverview } from '@/components/analytics/KPIOverview';
import { FinancialOverviewChart } from '@/components/analytics/FinancialOverviewChart';
import { PropertyInsightsCharts } from '@/components/analytics/PropertyInsightsCharts';
import { TaskTypeBreakdownChart } from '@/components/analytics/TaskTypeBreakdownChart';
import { TeamPerformanceTable } from '@/components/analytics/TeamPerformanceTable';
import { useAnalytics } from '@/hooks/useAnalytics';

const Analytics: React.FC = () => {
  const {
    data,
    loading,
    error,
    filters,
    updateFilters,
    getProperties
  } = useAnalytics();

  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const propertiesData = await getProperties();
      setProperties(propertiesData);
    };
    fetchProperties();
  }, [getProperties]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Failed to Load Analytics</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Strategic insights and performance metrics for data-driven decision making
        </p>
      </div>

      {/* Global Filters */}
      <AnalyticsFiltersCard
        filters={filters}
        onFiltersChange={updateFilters}
        properties={properties}
        loading={loading}
      />

      {/* KPI Overview */}
      <KPIOverview 
        data={data?.kpis || { totalOperationalCosts: 0, tasksCompleted: 0, openIssues: 0, avgCostPerTask: 0 }}
        loading={loading}
      />

      {/* Financial Overview */}
      <FinancialOverviewChart
        data={data?.financialOverview || []}
        loading={loading}
      />

      {/* Property Insights and Task Priorities */}
      <PropertyInsightsCharts
        propertyData={data?.propertyInsights || []}
        priorityData={data?.taskPriorities || []}
        loading={loading}
      />

      {/* Task Type Breakdown */}
      <TaskTypeBreakdownChart
        data={data?.taskTypeBreakdown || []}
        loading={loading}
      />

      {/* Team Performance */}
      <TeamPerformanceTable
        data={data?.teamPerformance || []}
        loading={loading}
      />
    </div>
  );
};

export default Analytics;