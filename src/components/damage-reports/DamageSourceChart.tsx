import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DamageSourceSummary } from '@/types/damage-reports.types';

interface DamageSourceChartProps {
  data: DamageSourceSummary[];
  onSourceClick?: (source: string) => void;
}

export const DamageSourceChart: React.FC<DamageSourceChartProps> = ({
  data,
  onSourceClick
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">{data.count}</span> reports
          </p>
          <p className="text-sm text-muted-foreground">
            Total: <span className="text-primary font-medium">€{data.totalCost.toFixed(2)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Average: <span className="text-primary font-medium">€{data.averageCost.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (onSourceClick) {
      onSourceClick(data.source);
    }
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Damage Source Summary</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No damage reports to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Damage Source Summary & Costs</CardTitle>
        <CardDescription>
          Click on a bar to filter reports by source
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="source" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="totalCost" 
                name="Total Cost (€)"
                radius={[2, 2, 0, 0]}
                className="cursor-pointer"
                onClick={handleBarClick}
                fill="currentColor"
                style={{ color: 'hsl(var(--primary))' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          {data.map((item) => (
            <div 
              key={item.source}
              className="text-center cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
              onClick={() => onSourceClick?.(item.source)}
            >
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.count}
              </div>
              <div className="text-sm font-medium">{item.source}</div>
              <div className="text-xs text-muted-foreground">
                €{item.totalCost.toFixed(0)} total
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};