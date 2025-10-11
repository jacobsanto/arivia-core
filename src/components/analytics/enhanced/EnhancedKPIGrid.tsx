import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KPIMetrics } from '@/types/analytics.types';
import { 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Calculator,
  TrendingUp,
  TrendingDown,
  Activity,
  Target
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EnhancedKPIGridProps {
  data?: KPIMetrics;
  loading: boolean;
}

export const EnhancedKPIGrid: React.FC<EnhancedKPIGridProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Operational Costs',
      value: data?.totalOperationalCosts || 0,
      format: 'currency',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%',
      trendType: 'up' as const,
      description: 'Total costs across all operations this period'
    },
    {
      title: 'Tasks Completed',
      value: data?.tasksCompleted || 0,
      format: 'number',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+8%',
      trendType: 'up' as const,
      description: 'Successfully completed tasks'
    },
    {
      title: 'Open Issues',
      value: data?.openIssues || 0,
      format: 'number',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '-3%',
      trendType: 'down' as const,
      description: 'Outstanding items requiring attention'
    },
    {
      title: 'Avg Cost per Task',
      value: data?.avgCostPerTask || 0,
      format: 'currency',
      icon: Calculator,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+5%',
      trendType: 'up' as const,
      description: 'Average cost efficiency per completed task'
    }
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getEfficiencyScore = () => {
    if (!data) return 0;
    const totalTasks = data.tasksCompleted + data.openIssues;
    return totalTasks > 0 ? (data.tasksCompleted / totalTasks) * 100 : 0;
  };

  const efficiencyScore = getEfficiencyScore();

  return (
    <div className="space-y-6">
      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trendType === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatValue(kpi.value, kpi.format)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={kpi.trendType === 'up' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {kpi.trend}
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Efficiency Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Operational Efficiency
            </CardTitle>
            <CardDescription>
              Overall performance metrics and completion rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Task Completion Rate</span>
                <span className="font-medium">{efficiencyScore.toFixed(1)}%</span>
              </div>
              <Progress value={efficiencyScore} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 rounded-lg bg-green-50">
                <div className="text-lg font-bold text-green-600">
                  {data?.tasksCompleted || 0}
                </div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50">
                <div className="text-lg font-bold text-orange-600">
                  {data?.openIssues || 0}
                </div>
                <div className="text-xs text-orange-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Cost Analysis
            </CardTitle>
            <CardDescription>
              Breakdown of operational expenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average per Task</span>
                <span className="font-medium">
                  {formatValue(data?.avgCostPerTask || 0, 'currency')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Costs</span>
                <span className="font-medium">
                  {formatValue(data?.totalOperationalCosts || 0, 'currency')}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cost Efficiency</span>
                  <Badge variant="outline">
                    {data?.avgCostPerTask && data.avgCostPerTask < 100 ? 'Good' : 'Monitor'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};