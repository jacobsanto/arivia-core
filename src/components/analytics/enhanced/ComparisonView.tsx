import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsData } from '@/types/analytics.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LoadingSpinner } from '@/components/mvp/LoadingSpinner';
import { GitCompare, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

interface ComparisonViewProps {
  data?: AnalyticsData | null;
  loading: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ data, loading }) => {
  const [comparisonType, setComparisonType] = useState<'periods' | 'properties' | 'teams'>('periods');
  const [selectedMetric, setSelectedMetric] = useState<'costs' | 'tasks' | 'efficiency'>('costs');

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading comparison data..." />;
  }

  // Mock previous period data for comparison
  const generateComparisonData = () => {
    if (!data) return [];

    switch (comparisonType) {
      case 'periods':
        return [
          {
            name: 'Previous Period',
            costs: (data.kpis.totalOperationalCosts * 0.85).toFixed(0),
            tasks: Math.floor(data.kpis.tasksCompleted * 0.9),
            efficiency: 78,
            color: '#94a3b8'
          },
          {
            name: 'Current Period',
            costs: data.kpis.totalOperationalCosts.toFixed(0),
            tasks: data.kpis.tasksCompleted,
            efficiency: 85,
            color: '#3b82f6'
          }
        ];
      
      case 'properties':
        return data.propertyInsights?.slice(0, 4).map((property, index) => ({
          name: property.propertyName.substring(0, 12),
          costs: property.totalCosts.toFixed(0),
          tasks: property.taskCount,
          efficiency: 70 + Math.random() * 30,
          color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]
        })) || [];
      
      case 'teams':
        return data.teamPerformance?.slice(0, 4).map((member, index) => ({
          name: member.role,
          costs: member.totalMaintenanceCosts.toFixed(0),
          tasks: member.completedTasks,
          efficiency: 60 + (member.completedTasks / 10) * 10,
          color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]
        })) || [];
      
      default:
        return [];
    }
  };

  const comparisonData = generateComparisonData();

  const getMetricKey = () => {
    switch (selectedMetric) {
      case 'costs': return 'costs';
      case 'tasks': return 'tasks';
      case 'efficiency': return 'efficiency';
      default: return 'costs';
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'costs': return 'Total Costs ($)';
      case 'tasks': return 'Completed Tasks';
      case 'efficiency': return 'Efficiency Score (%)';
      default: return 'Total Costs ($)';
    }
  };

  const calculateChange = () => {
    if (comparisonType === 'periods' && comparisonData.length >= 2) {
      const current = Number(comparisonData[1][getMetricKey()]);
      const previous = Number(comparisonData[0][getMetricKey()]);
      const change = ((current - previous) / previous) * 100;
      return change;
    }
    return 0;
  };

  const change = calculateChange();

  return (
    <div className="space-y-6">
      {/* Comparison Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparison Analysis
          </CardTitle>
          <CardDescription>
            Compare performance across different dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Compare By</label>
              <Select value={comparisonType} onValueChange={(value) => setComparisonType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="periods">Time Periods</SelectItem>
                  <SelectItem value="properties">Properties</SelectItem>
                  <SelectItem value="teams">Team Roles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Metric</label>
              <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="costs">Total Costs</SelectItem>
                  <SelectItem value="tasks">Completed Tasks</SelectItem>
                  <SelectItem value="efficiency">Efficiency Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{getMetricLabel()} Comparison</span>
            {comparisonType === 'periods' && (
              <Badge 
                variant={change >= 0 ? 'default' : 'destructive'}
                className="flex items-center gap-1"
              >
                {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(change).toFixed(1)}%
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Visual comparison of {getMetricLabel().toLowerCase()} across selected dimension
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  selectedMetric === 'costs' ? `$${Number(value).toLocaleString()}` : value,
                  getMetricLabel()
                ]}
              />
              <Bar 
                dataKey={getMetricKey()} 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparison Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisonData.slice(0, 3).map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{item.name}</h4>
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Costs:</span>
                  <span className="font-medium">${Number(item.costs).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tasks:</span>
                  <span className="font-medium">{item.tasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Efficiency:</span>
                  <span className="font-medium">{item.efficiency.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};