
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PerformanceMetricsChart } from '@/components/analytics/PerformanceMetricsChart';
import { MetricSummary } from '@/components/analytics/MetricSummary';
import { useIsMobile } from "@/hooks/use-mobile";
import { DollarSign, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Skeleton } from "@/components/ui/skeleton";

export const FinancialReports: React.FC = () => {
  const { selectedProperty, selectedYear, financialData, isLoading } = useAnalytics();
  const isMobile = useIsMobile();
  
  // Get the financial overview title based on filters
  const getFinancialOverviewTitle = () => {
    return selectedProperty === 'all' 
      ? "Annual Financial Overview" 
      : `${selectedProperty} Financial Overview`;
  };

  // Get the financial overview description
  const getFinancialOverviewDescription = () => {
    return selectedProperty === 'all'
      ? `Combined monthly revenue, expenses and profit for ${selectedYear}`
      : `Monthly revenue, expenses and profit for ${selectedProperty} in ${selectedYear}`;
  };
  
  // Filter data based on selected property and transform for charts
  const getFilteredChartData = () => {
    let filteredData = financialData;
    
    if (selectedProperty !== 'all') {
      filteredData = filteredData.filter(item => item.property === selectedProperty);
    }
    
    // Transform for the chart
    return filteredData.map(item => ({
      name: item.month,
      revenue: item.revenue,
      expenses: item.expenses,
      profit: item.profit
    }));
  };
  
  // Group data by property for comparison
  const getProfitabilityByPropertyData = () => {
    const propertyData: Record<string, { revenue: number, expenses: number, profit: number }> = {};
    
    financialData.forEach(item => {
      if (!propertyData[item.property]) {
        propertyData[item.property] = { revenue: 0, expenses: 0, profit: 0 };
      }
      
      propertyData[item.property].revenue += item.revenue;
      propertyData[item.property].expenses += item.expenses;
      propertyData[item.property].profit += item.profit;
    });
    
    return Object.entries(propertyData).map(([property, data]) => ({
      name: property,
      ...data
    }));
  };
  
  // Calculate expense categories
  const getExpenseCategories = () => {
    const categories: Record<string, number> = {};
    let totalExpenses = 0;
    
    // Filter by property if needed
    const relevantData = selectedProperty === 'all' 
      ? financialData 
      : financialData.filter(item => item.property === selectedProperty);
    
    // Group expenses by category
    relevantData.forEach(item => {
      if (!item.category || item.category === 'revenue') return;
      
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      
      categories[item.category] += item.expenses;
      totalExpenses += item.expenses;
    });
    
    // Convert to percentage
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0
    }));
  };
  
  const chartData = getFilteredChartData();
  const propertyComparisonData = getProfitabilityByPropertyData();
  const expenseCategoriesData = getExpenseCategories();
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>{getFinancialOverviewTitle()}</CardTitle>
              <CardDescription>{getFinancialOverviewDescription()}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PerformanceMetricsChart 
            title={getFinancialOverviewTitle()}
            data={chartData} 
            height={300} 
            type="multi-line" 
            dataKeys={[
              { key: 'revenue', name: 'Revenue', color: '#4CAF50' },
              { key: 'expenses', name: 'Expenses', color: '#F44336' },
              { key: 'profit', name: 'Profit', color: '#2196F3' }
            ]}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricSummary 
          title="Total Revenue" 
          value={`€${financialData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
          description="Total revenue across all properties"
        />
        
        <MetricSummary 
          title="Total Expenses" 
          value={`€${financialData.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 8, isPositive: false }}
          description="Total operating expenses"
        />
        
        <MetricSummary 
          title="Net Profit" 
          value={`€${financialData.reduce((sum, item) => sum + item.profit, 0).toLocaleString()}`}
          icon={<BarChart3 className="h-4 w-4" />}
          trend={{ value: 18, isPositive: true }}
          description="Total profit margin"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedProperty === 'all' && (
          <Card>
            <CardHeader>
              <CardTitle>Profitability by Property</CardTitle>
              <CardDescription>Revenue and expenses comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMetricsChart 
                title="Profitability by Property"
                data={propertyComparisonData}
                height={300}
                hideLegend={isMobile}
                type="bar"
                dataKeys={[
                  { key: 'revenue', name: 'Revenue', color: '#4CAF50' },
                  { key: 'expenses', name: 'Expenses', color: '#F44336' },
                  { key: 'profit', name: 'Profit', color: '#2196F3' }
                ]}
              />
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>
              {selectedProperty === 'all' 
                ? 'Expense distribution across all properties' 
                : `Expense distribution for ${selectedProperty}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {expenseCategoriesData.length > 0 ? (
                <PieChart className="h-36 w-36 text-muted-foreground/30" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                  <p>No expense data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
