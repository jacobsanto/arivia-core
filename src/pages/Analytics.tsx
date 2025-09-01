import React, { useState, useEffect } from 'react';
import { AnalyticsFiltersCard } from '@/components/analytics/AnalyticsFiltersCard';
import { KPIOverview } from '@/components/analytics/KPIOverview';
import { FinancialOverviewChart } from '@/components/analytics/FinancialOverviewChart';
import { PropertyInsightsCharts } from '@/components/analytics/PropertyInsightsCharts';
import { TaskTypeBreakdownChart } from '@/components/analytics/TaskTypeBreakdownChart';
import { TeamPerformanceTable } from '@/components/analytics/TeamPerformanceTable';
import { EnhancedKPIGrid } from '@/components/analytics/enhanced/EnhancedKPIGrid';
import { RealTimeMetrics } from '@/components/analytics/enhanced/RealTimeMetrics';
import { AdvancedChartsGrid } from '@/components/analytics/enhanced/AdvancedChartsGrid';
import { AnalyticsInsights } from '@/components/analytics/enhanced/AnalyticsInsights';
import { ExportToolbar } from '@/components/analytics/enhanced/ExportToolbar';
import { ComparisonView } from '@/components/analytics/enhanced/ComparisonView';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Activity, Target, Download, RefreshCw, Zap, Eye } from 'lucide-react';
import ErrorBoundary from '@/components/ui/error-boundary';

const Analytics: React.FC = () => {
  const {
    data,
    loading,
    error,
    filters,
    updateFilters,
    getProperties,
    refetchData
  } = useAnalytics();

  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      const propertiesData = await getProperties();
      setProperties(propertiesData);
    };
    fetchProperties();
  }, [getProperties]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchData();
    setRefreshing(false);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analytics Unavailable</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics Hub</h1>
                <Badge variant="secondary" className="mt-1">
                  <Activity className="mr-1 h-3 w-3" />
                  Real-time Data
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">
              Comprehensive insights and performance metrics for strategic decision making
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <ExportToolbar data={data} loading={loading} />
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={loading || refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Global Filters */}
        <AnalyticsFiltersCard
          filters={filters}
          onFiltersChange={updateFilters}
          properties={properties}
          loading={loading}
        />

        {/* Real-time Metrics Bar */}
        <RealTimeMetrics data={data} loading={loading} />

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced KPI Grid */}
            <EnhancedKPIGrid data={data?.kpis} loading={loading} />

            {/* Original Components with Enhanced Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FinancialOverviewChart
                data={data?.financialOverview || []}
                loading={loading}
              />
              <PropertyInsightsCharts
                propertyData={data?.propertyInsights || []}
                priorityData={data?.taskPriorities || []}
                loading={loading}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskTypeBreakdownChart
                data={data?.taskTypeBreakdown || []}
                loading={loading}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Team Performance Overview
                  </CardTitle>
                  <CardDescription>
                    Quick view of top performing team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamPerformanceTable
                    data={data?.teamPerformance?.slice(0, 5) || []}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <AdvancedChartsGrid data={data} loading={loading} />
            
            {/* Full Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Complete Team Performance Analysis
                </CardTitle>
                <CardDescription>
                  Detailed performance metrics for all team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamPerformanceTable
                  data={data?.teamPerformance || []}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <ComparisonView data={data} loading={loading} />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <AnalyticsInsights data={data} loading={loading} />
          </TabsContent>
        </Tabs>

        {/* Footer Statistics */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-dashed">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {data?.teamPerformance?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Team Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {properties.length}
                </div>
                <div className="text-sm text-muted-foreground">Properties Tracked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {data?.taskTypeBreakdown?.reduce((sum, item) => sum + item.count, 0) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  ${(data?.kpis?.totalOperationalCosts || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Costs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default Analytics;