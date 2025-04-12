
import React from 'react';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { MetricSummary } from './MetricSummary';
import { useIsMobile } from "@/hooks/use-mobile";
import { Building, Users, CalendarClock, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitoringDashboard } from './MonitoringDashboard';
import { PropertyFilter } from '@/contexts/AnalyticsContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';

// Sample data for demonstration
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

const occupancyData = [
  { name: 'Jan', occupancy: 75 },
  { name: 'Feb', occupancy: 82 },
  { name: 'Mar', occupancy: 68 },
  { name: 'Apr', occupancy: 79 },
  { name: 'May', occupancy: 85 },
  { name: 'Jun', occupancy: 95 },
  { name: 'Jul', occupancy: 98 },
  { name: 'Aug', occupancy: 97 },
  { name: 'Sep', occupancy: 88 },
  { name: 'Oct', occupancy: 81 },
  { name: 'Nov', occupancy: 76 },
  { name: 'Dec', occupancy: 90 }
];

// Property-specific data
const propertyRevenueData = {
  'Villa Caldera': [
    { name: 'Jan', revenue: 3000, expenses: 1800, profit: 1200 },
    { name: 'Feb', revenue: 2500, expenses: 1100, profit: 1400 },
    // ... more data
  ],
  'Villa Sunset': [
    { name: 'Jan', revenue: 3500, expenses: 2000, profit: 1500 },
    { name: 'Feb', revenue: 3200, expenses: 1700, profit: 1500 },
    // ... more data
  ],
  'Villa Oceana': [
    { name: 'Jan', revenue: 4200, expenses: 2200, profit: 2000 },
    { name: 'Feb', revenue: 3800, expenses: 2000, profit: 1800 },
    // ... more data
  ],
  'Villa Paradiso': [
    { name: 'Jan', revenue: 3800, expenses: 2100, profit: 1700 },
    { name: 'Feb', revenue: 3600, expenses: 1900, profit: 1700 },
    // ... more data
  ],
  'Villa Azure': [
    { name: 'Jan', revenue: 3200, expenses: 1700, profit: 1500 },
    { name: 'Feb', revenue: 2900, expenses: 1500, profit: 1400 },
    // ... more data
  ]
};

const propertyPerformanceData = [
  { name: 'Villa Caldera', revenue: 45000, occupancy: 87, rating: 4.8 },
  { name: 'Villa Sunset', revenue: 38000, occupancy: 82, rating: 4.6 },
  { name: 'Villa Oceana', revenue: 52000, occupancy: 91, rating: 4.9 },
  { name: 'Villa Paradiso', revenue: 37000, occupancy: 78, rating: 4.3 },
  { name: 'Villa Azure', revenue: 42000, occupancy: 86, rating: 4.7 }
];

const taskCompletionData = [
  { name: 'Week 1', housekeeping: 95, maintenance: 80 },
  { name: 'Week 2', housekeeping: 98, maintenance: 85 },
  { name: 'Week 3', housekeeping: 92, maintenance: 78 },
  { name: 'Week 4', housekeeping: 96, maintenance: 88 }
];

interface AnalyticsDashboardProps {
  showAllCharts?: boolean;
  showMonitoring?: boolean;
  propertyFilter?: PropertyFilter;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  showAllCharts = true,
  showMonitoring = false,
  propertyFilter
}) => {
  const isMobile = useIsMobile();
  // If no prop is provided, use the context
  const { selectedProperty, selectedYear } = useAnalytics();
  const activeProperty = propertyFilter || selectedProperty;
  
  // Filter data based on selected property
  const getFilteredRevenueData = () => {
    if (activeProperty === 'all') {
      return revenueData;
    }
    return propertyRevenueData[activeProperty] || revenueData;
  };

  const getFilteredPropertyData = () => {
    if (activeProperty === 'all') {
      return propertyPerformanceData;
    }
    return propertyPerformanceData.filter(item => item.name === activeProperty);
  };

  // Prepare description text based on filter
  const getFinancialDescription = () => {
    return activeProperty === 'all'
      ? "Combined revenue, expenses and profit for all properties"
      : `Revenue, expenses and profit for ${activeProperty}`;
  };

  const getPropertyDescription = () => {
    return activeProperty === 'all'
      ? "Comparing revenue and occupancy across properties"
      : `Performance metrics for ${activeProperty}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        <MetricSummary 
          title="Properties"
          value={activeProperty === 'all' ? "5" : "1"}
          change={{ value: 0, isPositive: true }}
          icon={<Building className="h-5 w-5" />}
          variant="accent"
          size={isMobile ? "sm" : "md"}
        />
        <MetricSummary 
          title="Avg. Occupancy"
          value={activeProperty === 'all' ? "86%" : 
            `${propertyPerformanceData.find(p => p.name === activeProperty)?.occupancy || 0}%`}
          change={{ value: 4, isPositive: true }}
          icon={<Users className="h-5 w-5" />}
          variant="success"
          size={isMobile ? "sm" : "md"}
        />
        <MetricSummary 
          title="Task Completion"
          value="94%"
          change={{ value: 2, isPositive: true }}
          icon={<CalendarClock className="h-5 w-5" />}
          variant="info"
          size={isMobile ? "sm" : "md"}
        />
        <MetricSummary 
          title="Maint. Issues"
          value="7"
          change={{ value: 3, isPositive: false }}
          icon={<Wrench className="h-5 w-5" />}
          variant="warning"
          size={isMobile ? "sm" : "md"}
        />
      </div>
      
      {/* Activity Monitoring Section */}
      {showMonitoring && (
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Activity & System Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <MonitoringDashboard 
                compact={isMobile} 
                propertyFilter={activeProperty} 
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Financial Performance Chart */}
        <div>
          <PerformanceMetricsChart 
            title="Financial Performance" 
            description={getFinancialDescription()}
            type="multi-line"
            data={getFilteredRevenueData()}
            dataKeys={[
              { key: "revenue", name: "Revenue", color: "#8b5cf6" },
              { key: "expenses", name: "Expenses", color: "#f97316" },
              { key: "profit", name: "Profit", color: "#10b981" }
            ]}
          />
        </div>
        
        {/* Property Performance Comparison - only show if "all" is selected or we're showing a single property */}
        <div>
          <PerformanceMetricsChart 
            title="Property Performance" 
            description={getPropertyDescription()}
            type="bar"
            data={getFilteredPropertyData()}
            dataKeys={[
              { key: "revenue", name: "Revenue (€)", color: "#8b5cf6" },
              { key: "occupancy", name: "Occupancy (%)", color: "#0ea5e9" }
            ]}
          />
        </div>
        
        {/* Only show these charts if showAllCharts is true */}
        {showAllCharts && (
          <>
            {/* Occupancy Trends */}
            <div>
              <PerformanceMetricsChart 
                title="Occupancy Trends" 
                description="Monthly occupancy percentage"
                type="line"
                data={occupancyData}
                dataKeys={[
                  { key: "occupancy", name: "Occupancy (%)", color: "#0ea5e9" }
                ]}
              />
            </div>
            
            {/* Task Completion Rates */}
            <div>
              <PerformanceMetricsChart 
                title="Task Completion Rates" 
                description="Housekeeping vs maintenance completion rates"
                type="multi-line"
                data={taskCompletionData}
                dataKeys={[
                  { key: "housekeeping", name: "Housekeeping (%)", color: "#10b981" },
                  { key: "maintenance", name: "Maintenance (%)", color: "#f59e0b" }
                ]}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
