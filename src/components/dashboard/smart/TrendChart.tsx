import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { TrendingUp, BarChart3 } from "lucide-react";

interface TrendChartProps {
  title: string;
  dataKey: string;
  type?: 'line' | 'area';
  color?: string;
  days?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ 
  title, 
  dataKey, 
  type = 'area',
  color = '#3b82f6',
  days = 30 
}) => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['trend-chart', dataKey, days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, days);
      
      // Generate all dates in range
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      let data = [];

      switch (dataKey) {
        case 'bookings':
          const { data: bookings } = await supabase
            .from('guesty_bookings')
            .select('check_in, status')
            .eq('status', 'confirmed')
            .gte('check_in', format(startDate, 'yyyy-MM-dd'))
            .lte('check_in', format(endDate, 'yyyy-MM-dd'));

          data = dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const count = bookings?.filter(b => b.check_in === dateStr).length || 0;
            return {
              date: format(date, 'MMM dd'),
              value: count,
              fullDate: dateStr
            };
          });
          break;

        case 'revenue':
          const { data: financial } = await supabase
            .from('financial_reports')
            .select('check_in, revenue')
            .gte('check_in', format(startDate, 'yyyy-MM-dd'))
            .lte('check_in', format(endDate, 'yyyy-MM-dd'));

          data = dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dailyRevenue = financial?.filter(r => r.check_in === dateStr)
              .reduce((sum, r) => sum + (r.revenue || 0), 0) || 0;
            return {
              date: format(date, 'MMM dd'),
              value: Math.round(dailyRevenue),
              fullDate: dateStr
            };
          });
          break;

        case 'tasks':
          const { data: tasks } = await supabase
            .from('housekeeping_tasks')
            .select('created_at, status')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

          data = dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const count = tasks?.filter(t => 
              format(new Date(t.created_at), 'yyyy-MM-dd') === dateStr
            ).length || 0;
            return {
              date: format(date, 'MMM dd'),
              value: count,
              fullDate: dateStr
            };
          });
          break;

        default:
          // Generate sample data for unknown keys
          data = dateRange.map(date => ({
            date: format(date, 'MMM dd'),
            value: Math.floor(Math.random() * 100),
            fullDate: format(date, 'yyyy-MM-dd')
          }));
      }

      return data;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const formatValue = (value: number) => {
    if (dataKey === 'revenue') {
      return `€${value.toLocaleString()}`;
    }
    return value.toString();
  };

  const calculateTrend = () => {
    if (!chartData || chartData.length < 2) return null;
    
    const recent = chartData.slice(-7).reduce((sum, d) => sum + d.value, 0);
    const previous = chartData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0);
    
    if (previous === 0) return null;
    
    const change = ((recent - previous) / previous) * 100;
    return {
      percentage: Math.abs(Math.round(change)),
      direction: change > 0 ? 'up' : 'down',
      isPositive: change > 0
    };
  };

  const trend = calculateTrend();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
              {trend.percentage}% vs last week
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs text-muted-foreground"
                interval="preserveStartEnd"
              />
              <YAxis 
                className="text-xs text-muted-foreground"
                tickFormatter={formatValue}
              />
              <Tooltip 
                formatter={(value) => [formatValue(value as number), title]}
                labelClassName="text-foreground"
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              {type === 'area' ? (
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color}
                  fill={`${color}20`}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: color }}
                />
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: color }}
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};