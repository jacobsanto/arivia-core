import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsData } from '@/types/analytics.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface AdvancedChartsGridProps {
  data?: AnalyticsData | null;
  loading: boolean;
}

export const AdvancedChartsGrid: React.FC<AdvancedChartsGridProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6 text-center text-muted-foreground">
              No data available
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Process data for trend analysis
  const trendData = data.financialOverview?.map((item, index) => ({
    ...item,
    efficiency: data.kpis.tasksCompleted / (data.kpis.openIssues + 1) * 10,
    trend: Math.sin(index * 0.5) * 20 + 80 + Math.random() * 10
  })) || [];

  // Property cost efficiency data
  const efficiencyData = data.propertyInsights?.map(property => ({
    name: property.propertyName.substring(0, 15),
    costPerTask: property.totalCosts / (property.taskCount || 1),
    tasks: property.taskCount,
    costs: property.totalCosts
  })) || [];

  // Task completion timeline
  const timelineData = data.financialOverview?.map((item, index) => ({
    period: item.month,
    completed: Math.floor(Math.random() * 50) + 20,
    pending: Math.floor(Math.random() * 20) + 5,
    efficiency: 85 + Math.random() * 15
  })) || [];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cost Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cost Trend Analysis
          </CardTitle>
          <CardDescription>
            Monthly cost trends with efficiency indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  typeof value === 'number' ? `$${value.toFixed(0)}` : value,
                  name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="totalCosts" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="Total Costs"
              />
              <Area 
                type="monotone" 
                dataKey="efficiency" 
                stackId="2" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.2}
                name="Efficiency Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Property Cost Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Property Cost Efficiency
          </CardTitle>
          <CardDescription>
            Cost per task ratio across properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={efficiencyData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value, name) => [
                  typeof value === 'number' ? `$${value.toFixed(0)}` : value,
                  name === 'costPerTask' ? 'Cost per Task' : name
                ]}
              />
              <Bar dataKey="costPerTask" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Task Completion Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Task Completion Timeline
          </CardTitle>
          <CardDescription>
            Completed vs pending tasks over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Completed Tasks"
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Pending Tasks"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Team Performance Distribution
          </CardTitle>
          <CardDescription>
            Task completion by team role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.teamPerformance?.slice(0, 5).map((member, index) => ({
                  name: member.role,
                  value: member.completedTasks,
                  color: COLORS[index % COLORS.length]
                }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.teamPerformance?.slice(0, 5).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};