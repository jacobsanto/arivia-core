import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Download, RefreshCw } from 'lucide-react';
import { chartPalette } from '@/styles/chartPalette';

export const DataVisualization = () => {
  const [chartType, setChartType] = useState('bar');
  const [dataSource, setDataSource] = useState('revenue');
  const [timeRange, setTimeRange] = useState('month');

  // Sample data - would be replaced with real data
  const revenueData = [
    { name: 'Jan', value: 45000, bookings: 23 },
    { name: 'Feb', value: 52000, bookings: 28 },
    { name: 'Mar', value: 48000, bookings: 25 },
    { name: 'Apr', value: 61000, bookings: 32 },
    { name: 'May', value: 67000, bookings: 35 },
    { name: 'Jun', value: 71000, bookings: 38 }
  ];

  const occupancyData = [
    { name: 'Villa Aurora', value: 85, color: chartPalette.series[0] },
    { name: 'Villa Serenity', value: 92, color: chartPalette.series[1] },
    { name: 'Villa Paradise', value: 78, color: chartPalette.series[2] },
    { name: 'Villa Sunset', value: 88, color: chartPalette.series[3] },
    { name: 'Villa Dreams', value: 95, color: chartPalette.series[4] }
  ];

  const taskCompletionData = [
    { name: 'Mon', housekeeping: 95, maintenance: 87, total: 91 },
    { name: 'Tue', housekeeping: 88, maintenance: 92, total: 90 },
    { name: 'Wed', housekeeping: 92, maintenance: 85, total: 88 },
    { name: 'Thu', housekeeping: 98, maintenance: 90, total: 94 },
    { name: 'Fri', housekeeping: 85, maintenance: 88, total: 86 },
    { name: 'Sat', housekeeping: 90, maintenance: 95, total: 92 },
    { name: 'Sun', housekeeping: 87, maintenance: 82, total: 84 }
  ];

  const guestSatisfactionData = [
    { name: 'Excellent', value: 65, color: chartPalette.success },
    { name: 'Good', value: 25, color: chartPalette.info },
    { name: 'Average', value: 8, color: chartPalette.warning },
    { name: 'Poor', value: 2, color: chartPalette.destructive }
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: TrendingUp },
    { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
    { value: 'area', label: 'Area Chart', icon: Activity }
  ];

  const dataSources = [
    { value: 'revenue', label: 'Revenue & Bookings' },
    { value: 'occupancy', label: 'Property Occupancy' },
    { value: 'tasks', label: 'Task Completion' },
    { value: 'satisfaction', label: 'Guest Satisfaction' }
  ];

  const timeRanges = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last 12 Months' }
  ];

  const renderChart = () => {
    const getData = () => {
      switch (dataSource) {
        case 'revenue': return revenueData;
        case 'occupancy': return occupancyData;
        case 'tasks': return taskCompletionData;
        case 'satisfaction': return guestSatisfactionData;
        default: return revenueData;
      }
    };

    const data = getData();

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={chartPalette.info} />
              {dataSource === 'revenue' && <Bar dataKey="bookings" fill={chartPalette.success} />}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={chartPalette.info} strokeWidth={2} />
              {dataSource === 'tasks' && (
                <>
                  <Line type="monotone" dataKey="housekeeping" stroke={chartPalette.success} strokeWidth={2} />
                  <Line type="monotone" dataKey="maintenance" stroke={chartPalette.warning} strokeWidth={2} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke={chartPalette.info} fill={chartPalette.info} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          Interactive Data Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chart Type</label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Source</label>
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map(source => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Chart Display */}
        <div className="border rounded-lg p-4 bg-background">
          {renderChart()}
        </div>

        {/* Chart Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">€284K</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <Badge variant="secondary" className="mt-1">+12% vs last period</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">87.6%</p>
                <p className="text-sm text-muted-foreground">Avg Occupancy</p>
                <Badge variant="secondary" className="mt-1">+5.2% vs last period</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">90%</p>
                <p className="text-sm text-muted-foreground">Guest Satisfaction</p>
                <Badge variant="secondary" className="mt-1">+3% vs last period</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Legend */}
        {dataSource === 'tasks' && chartType === 'line' && (
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: chartPalette.info }}></div>
              <span className="text-sm">Total Completion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: chartPalette.success }}></div>
              <span className="text-sm">Housekeeping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: chartPalette.warning }}></div>
              <span className="text-sm">Maintenance</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};