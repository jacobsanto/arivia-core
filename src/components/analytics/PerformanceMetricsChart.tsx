import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";
import { SaveAsReportButton } from '../reports/analytics/SaveAsReportButton';
interface DataKey {
  key: string;
  name: string;
  color: string;
}
interface PerformanceMetricsChartProps {
  title: string;
  description?: string;
  type: 'line' | 'bar' | 'multi-line';
  data: any[];
  dataKeys: DataKey[];
}
export const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({
  title,
  description,
  type,
  data,
  dataKeys
}) => {
  const isMobile = useIsMobile();
  const getChartDataType = (): 'financial' | 'occupancy' | 'performance' | 'task' | 'activity' => {
    if (title.toLowerCase().includes('financial') || title.toLowerCase().includes('revenue')) {
      return 'financial';
    } else if (title.toLowerCase().includes('occupancy')) {
      return 'occupancy';
    } else if (title.toLowerCase().includes('task')) {
      return 'task';
    } else if (title.toLowerCase().includes('activity')) {
      return 'activity';
    }
    return 'performance';
  };

  // Determine chart type and render appropriate chart
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{
              fontSize: isMobile ? 10 : 12
            }} />
              <YAxis tick={{
              fontSize: isMobile ? 10 : 12
            }} />
              <Tooltip />
              <Legend />
              {dataKeys.map(dk => <Line key={dk.key} type="monotone" dataKey={dk.key} name={dk.name} stroke={dk.color} activeDot={{
              r: 8
            }} />)}
            </LineChart>
          </ResponsiveContainer>;
      case 'bar':
        return <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{
              fontSize: isMobile ? 10 : 12
            }} />
              <YAxis tick={{
              fontSize: isMobile ? 10 : 12
            }} />
              <Tooltip />
              <Legend />
              {dataKeys.map(dk => <Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color} />)}
            </BarChart>
          </ResponsiveContainer>;
      case 'multi-line':
        return <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{
              fontSize: isMobile ? 10 : 12
            }} />
              <YAxis tick={{
              fontSize: isMobile ? 10 : 12
            }} />
              <Tooltip />
              <Legend />
              {dataKeys.map(dk => <Line key={dk.key} type="monotone" dataKey={dk.key} name={dk.name} stroke={dk.color} />)}
            </LineChart>
          </ResponsiveContainer>;
      default:
        return null;
    }
  };
  return <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 rounded-none px-0 mx-0 my-0">
        {renderChart()}
      </CardContent>
      <CardFooter className="flex justify-end pt-0 pb-4">
        <SaveAsReportButton chartTitle={title} dataType={getChartDataType()} data={data} />
      </CardFooter>
    </Card>;
};