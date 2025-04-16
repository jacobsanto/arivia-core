
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceMetricsChart } from '@/components/analytics/PerformanceMetricsChart';

interface FinancialOverviewChartProps {
  title: string;
  description: string;
  chartData: any[];
}

export const FinancialOverviewChart: React.FC<FinancialOverviewChartProps> = ({ 
  title, 
  description, 
  chartData 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PerformanceMetricsChart 
          title={title}
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
  );
};
