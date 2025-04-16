
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  height={40}
                  tickMargin={5}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                {!isMobile && <Legend />}
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue" 
                  stroke="#4CAF50" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  name="Expenses" 
                  stroke="#F44336"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  name="Profit" 
                  stroke="#2196F3"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p>No financial data available</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
