
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface OccupancyRateChartProps {
  title: string;
  description: string;
  chartData: any[];
}

export const OccupancyRateChart: React.FC<OccupancyRateChartProps> = ({
  title,
  description,
  chartData
}) => {
  // Calculate average occupancy rate
  const avgOccupancy = chartData.length > 0
    ? Math.round(chartData.reduce((sum, item) => sum + item.occupancy, 0) / chartData.length)
    : 0;
    
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <ReferenceLine y={avgOccupancy} stroke="#ff7300" strokeDasharray="3 3" label={`Avg: ${avgOccupancy}%`} />
              <Line
                type="monotone"
                dataKey="occupancy"
                name="Occupancy Rate"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
