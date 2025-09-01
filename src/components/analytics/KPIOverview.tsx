import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle2, AlertCircle, Calculator } from 'lucide-react';
import { KPIMetrics } from '@/types/analytics.types';

interface KPIOverviewProps {
  data: KPIMetrics;
  loading: boolean;
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({ data, loading }) => {
  const kpiCards = [
    {
      title: 'Total Operational Costs',
      value: data.totalOperationalCosts,
      format: 'currency',
      icon: DollarSign,
      description: 'Maintenance + Damage costs',
      trend: 'neutral' as const,
      color: 'text-red-600'
    },
    {
      title: 'Tasks Completed',
      value: data.tasksCompleted,
      format: 'number',
      icon: CheckCircle2,
      description: 'All completed tasks',
      trend: 'up' as const,
      color: 'text-green-600'
    },
    {
      title: 'Open Issues',
      value: data.openIssues,
      format: 'number',
      icon: AlertCircle,
      description: 'Tasks + unresolved reports',
      trend: 'down' as const,
      color: 'text-orange-600'
    },
    {
      title: 'Avg. Cost per Task',
      value: data.avgCostPerTask,
      format: 'currency',
      icon: Calculator,
      description: 'Efficiency metric',
      trend: 'neutral' as const,
      color: 'text-blue-600'
    }
  ];

  const formatValue = (value: number, format: string) => {
    if (loading) return '...';
    
    switch (format) {
      case 'currency':
        return `€${value.toFixed(2)}`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                {formatValue(kpi.value, kpi.format)}
              </div>
              {getTrendIcon(kpi.trend)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};