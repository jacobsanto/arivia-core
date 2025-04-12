
import React from 'react';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { MetricSummary } from './MetricSummary';
import { useIsMobile } from "@/hooks/use-mobile";
import { Building, Users, CalendarClock, Tool } from "lucide-react";

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
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ showAllCharts = true }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        <MetricSummary 
          title="Properties"
          value="5"
          change={{ value: 0, isPositive: true }}
          icon={<Building className="h-5 w-5" />}
          variant="accent"
          size={isMobile ? "sm" : "md"}
        />
        <MetricSummary 
          title="Avg. Occupancy"
          value="86%"
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
          icon={<Tool className="h-5 w-5" />}
          variant="warning"
          size={isMobile ? "sm" : "md"}
        />
      </div>
      
      {/* Financial Performance Chart */}
      <PerformanceMetricsChart 
        title="Financial Performance" 
        description="Revenue, expenses and profit over time"
        type="multi-line"
        data={revenueData}
        dataKeys={[
          { key: "revenue", name: "Revenue", color: "#8b5cf6" },
          { key: "expenses", name: "Expenses", color: "#f97316" },
          { key: "profit", name: "Profit", color: "#10b981" }
        ]}
      />
      
      {/* Property Performance Comparison */}
      <PerformanceMetricsChart 
        title="Property Performance" 
        description="Comparing revenue and occupancy across properties"
        type="bar"
        data={propertyPerformanceData}
        dataKeys={[
          { key: "revenue", name: "Revenue (€)", color: "#8b5cf6" },
          { key: "occupancy", name: "Occupancy (%)", color: "#0ea5e9" }
        ]}
      />
      
      {/* Only show these charts if showAllCharts is true */}
      {showAllCharts && (
        <>
          {/* Occupancy Trends */}
          <PerformanceMetricsChart 
            title="Occupancy Trends" 
            description="Monthly occupancy percentage"
            type="line"
            data={occupancyData}
            dataKeys={[
              { key: "occupancy", name: "Occupancy (%)", color: "#0ea5e9" }
            ]}
          />
          
          {/* Task Completion Rates */}
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
        </>
      )}
    </div>
  );
};
