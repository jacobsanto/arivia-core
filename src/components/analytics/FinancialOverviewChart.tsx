import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';
import { FinancialOverviewData } from '@/types/analytics.types';

interface FinancialOverviewChartProps {
  data: FinancialOverviewData[];
  loading: boolean;
}

export const FinancialOverviewChart: React.FC<FinancialOverviewChartProps> = ({ data, loading }) => {
  const totalCosts = data.reduce((sum, item) => sum + item.totalCosts, 0);
  const avgMonthlyCost = data.length > 0 ? totalCosts / data.length : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Loading financial data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            €{avgMonthlyCost.toFixed(0)}/month avg
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No financial data available for the selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `€${value.toFixed(2)}`,
                  name === 'maintenanceCosts' ? 'Maintenance' : 'Damages'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="maintenanceCosts" 
                stackId="costs" 
                fill="#3b82f6" 
                name="Maintenance"
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="damageCosts" 
                stackId="costs" 
                fill="#ef4444" 
                name="Damages"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};