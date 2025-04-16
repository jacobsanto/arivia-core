
import React from 'react';
import { MetricSummary } from '@/components/analytics/MetricSummary';
import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";

interface FinancialMetricsCardsProps {
  financialData: any[];
}

export const FinancialMetricsCards: React.FC<FinancialMetricsCardsProps> = ({ financialData }) => {
  return (
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
  );
};
