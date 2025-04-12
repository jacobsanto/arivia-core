
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PerformanceMetricsChart } from '@/components/analytics/PerformanceMetricsChart';
import { MetricSummary } from '@/components/analytics/MetricSummary';
import { useIsMobile } from "@/hooks/use-mobile";
import { DollarSign, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { formatFinancialReportData } from './financialData';

// Sample data
const revenueData = [
  { name: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
  { name: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
  { name: 'Mar', revenue: 2000, expenses: 9800, profit: -7800 },
  { name: 'Apr', revenue: 2780, expenses: 3908, profit: -1128 },
  { name: 'May', revenue: 1890, expenses: 4800, profit: -2910 },
  { name: 'Jun', revenue: 2390, expenses: 3800, profit: -1410 },
  { name: 'Jul', revenue: 3490, expenses: 4300, profit: -810 },
  { name: 'Aug', revenue: 5000, expenses: 3800, profit: 1200 },
  { name: 'Sep', revenue: 6000, expenses: 4000, profit: 2000 },
  { name: 'Oct', revenue: 7000, expenses: 4300, profit: 2700 },
  { name: 'Nov', revenue: 7500, expenses: 4400, profit: 3100 },
  { name: 'Dec', revenue: 8000, expenses: 5000, profit: 3000 }
];

const profitabilityByPropertyData = [
  { name: 'Villa Caldera', revenue: 45000, expenses: 23000, profit: 22000 },
  { name: 'Villa Sunset', revenue: 38000, expenses: 19000, profit: 19000 },
  { name: 'Villa Oceana', revenue: 52000, expenses: 28000, profit: 24000 },
  { name: 'Villa Paradiso', revenue: 37000, expenses: 25000, profit: 12000 },
  { name: 'Villa Azure', revenue: 42000, expenses: 20000, profit: 22000 }
];

const expenseCategories = [
  { name: 'Maintenance', value: 35 },
  { name: 'Staff', value: 25 },
  { name: 'Utilities', value: 15 },
  { name: 'Supplies', value: 10 },
  { name: 'Marketing', value: 8 },
  { name: 'Other', value: 7 }
];

export const FinancialReports: React.FC = () => {
  const { selectedProperty, selectedYear } = useAnalytics();
  const isMobile = useIsMobile();
  
  // Filter data based on selected property
  const getFilteredData = () => {
    if (selectedProperty === 'all') {
      return profitabilityByPropertyData;
    }
    return profitabilityByPropertyData.filter(item => item.name === selectedProperty);
  };

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
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>
                {selectedProperty === 'all'
                  ? 'Comprehensive financial data across all properties'
                  : `Financial data for ${selectedProperty}`
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="p-6 pt-2">
            <TabsList className="mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Revenue</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Expenses</span>
              </TabsTrigger>
              <TabsTrigger value="profitability" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span>Profitability</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                <MetricSummary 
                  title="Total Revenue"
                  value="€384,550"
                  change={{ value: 12, isPositive: true }}
                  variant="accent"
                  size={isMobile ? "sm" : "md"}
                />
                <MetricSummary 
                  title="Total Expenses"
                  value="€184,200"
                  change={{ value: 5, isPositive: false }}
                  variant="warning"
                  size={isMobile ? "sm" : "md"}
                />
                <MetricSummary 
                  title="Net Profit"
                  value="€200,350"
                  change={{ value: 18, isPositive: true }}
                  variant="success"
                  size={isMobile ? "sm" : "md"}
                />
                <MetricSummary 
                  title="Profit Margin"
                  value="52.1%"
                  change={{ value: 3.5, isPositive: true }}
                  variant="info"
                  size={isMobile ? "sm" : "md"}
                />
              </div>
              
              <PerformanceMetricsChart 
                title={getFinancialOverviewTitle()} 
                description={getFinancialOverviewDescription()}
                type="multi-line"
                data={revenueData}
                dataKeys={[
                  { key: "revenue", name: "Revenue", color: "#8b5cf6" },
                  { key: "expenses", name: "Expenses", color: "#f97316" },
                  { key: "profit", name: "Profit", color: "#10b981" }
                ]}
              />
              
              {selectedProperty === 'all' && (
                <PerformanceMetricsChart 
                  title="Property Profitability" 
                  description="Revenue, expenses and profit by property"
                  type="bar"
                  data={getFilteredData()}
                  dataKeys={[
                    { key: "revenue", name: "Revenue", color: "#8b5cf6" },
                    { key: "expenses", name: "Expenses", color: "#f97316" },
                    { key: "profit", name: "Profit", color: "#10b981" }
                  ]}
                />
              )}
            </TabsContent>
            
            <TabsContent value="revenue" className="space-y-6">
              {/* Revenue-specific content can be added here */}
              <PerformanceMetricsChart 
                title="Revenue Trends" 
                description={`Monthly revenue for ${selectedProperty === 'all' ? 'all properties' : selectedProperty}`}
                type="line"
                data={revenueData}
                dataKeys={[
                  { key: "revenue", name: "Revenue", color: "#8b5cf6" }
                ]}
              />
            </TabsContent>
            
            <TabsContent value="expenses" className="space-y-6">
              {/* Expenses-specific content can be added here */}
              <PerformanceMetricsChart 
                title="Expense Categories" 
                description={`Breakdown of expense types for ${selectedProperty === 'all' ? 'all properties' : selectedProperty}`}
                type="bar"
                data={expenseCategories}
                dataKeys={[
                  { key: "value", name: "Percentage (%)", color: "#f97316" }
                ]}
              />
            </TabsContent>
            
            <TabsContent value="profitability" className="space-y-6">
              {/* Profitability-specific content can be added here */}
              <PerformanceMetricsChart 
                title="Property Comparison" 
                description="Profit margin by property"
                type="bar"
                data={getFilteredData()}
                dataKeys={[
                  { key: "profit", name: "Profit (€)", color: "#10b981" }
                ]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
