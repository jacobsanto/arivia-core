
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

interface DataItem {
  name: string;
  [key: string]: string | number;
}

interface PerformanceMetricsChartProps {
  title: string;
  description?: string;
  data: DataItem[];
  type: 'line' | 'bar' | 'multi-line';
  dataKeys: {
    key: string;
    name: string;
    color: string;
  }[];
  showGrid?: boolean;
}

export const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({
  title,
  description,
  data,
  type,
  dataKeys,
  showGrid = true
}) => {
  const isMobile = useIsMobile();
  
  const config = dataKeys.reduce((acc, item) => {
    acc[item.key] = {
      label: item.name,
      color: item.color
    };
    return acc;
  }, {} as Record<string, { label: string, color: string }>);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: isMobile ? 10 : 12 }} 
              angle={isMobile ? -45 : 0} 
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
            />
            <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((dataKey, index) => (
              <Line 
                key={`line-${index}`}
                type="monotone" 
                dataKey={dataKey.key} 
                stroke={dataKey.color} 
                activeDot={{ r: 6 }} 
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: isMobile ? 10 : 12 }} 
              angle={isMobile ? -45 : 0} 
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
            />
            <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((dataKey, index) => (
              <Bar 
                key={`bar-${index}`}
                dataKey={dataKey.key} 
                fill={dataKey.color} 
              />
            ))}
          </BarChart>
        );
      
      case 'multi-line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: isMobile ? 10 : 12 }} 
              angle={isMobile ? -45 : 0} 
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
            />
            <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((dataKey, index) => (
              <Line 
                key={`line-${index}`}
                type="monotone" 
                dataKey={dataKey.key} 
                stroke={dataKey.color} 
                activeDot={{ r: 6 }}
                strokeWidth={2} 
              />
            ))}
          </LineChart>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4">
        <div className="aspect-[16/9] w-full">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
