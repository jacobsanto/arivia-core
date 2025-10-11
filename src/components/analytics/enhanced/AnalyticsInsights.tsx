import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnalyticsData } from '@/types/analytics.types';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  DollarSign,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AnalyticsInsightsProps {
  data?: AnalyticsData | null;
  loading: boolean;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No data available to generate insights.
        </AlertDescription>
      </Alert>
    );
  }

  // Generate AI-like insights based on data
  const generateInsights = () => {
    const insights = [];

    // Cost efficiency insight
    const avgCost = data.kpis.avgCostPerTask;
    if (avgCost > 100) {
      insights.push({
        type: 'warning',
        title: 'High Cost per Task Detected',
        description: `Average cost per task ($${avgCost.toFixed(0)}) is above the recommended threshold. Consider optimizing resource allocation.`,
        icon: DollarSign,
        priority: 'high',
        actionable: true,
        recommendation: 'Review maintenance procedures and supplier costs'
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Excellent Cost Efficiency',
        description: `Average cost per task ($${avgCost.toFixed(0)}) is within optimal range.`,
        icon: CheckCircle,
        priority: 'low',
        actionable: false,
        recommendation: 'Maintain current cost management practices'
      });
    }

    // Task completion insight
    const completionRate = (data.kpis.tasksCompleted / (data.kpis.tasksCompleted + data.kpis.openIssues)) * 100;
    if (completionRate < 80) {
      insights.push({
        type: 'warning',
        title: 'Task Completion Rate Below Target',
        description: `Current completion rate (${completionRate.toFixed(1)}%) needs improvement.`,
        icon: Target,
        priority: 'medium',
        actionable: true,
        recommendation: 'Increase team capacity or prioritize high-impact tasks'
      });
    }

    // Property performance insight
    const topProperty = data.propertyInsights?.[0];
    if (topProperty) {
      insights.push({
        type: 'info',
        title: 'Top Performing Property',
        description: `${topProperty.propertyName} has the highest operational costs but also high task volume.`,
        icon: TrendingUp,
        priority: 'medium',
        actionable: true,
        recommendation: 'Analyze efficiency strategies to apply to other properties'
      });
    }

    // Team performance insight
    const topPerformer = data.teamPerformance?.[0];
    if (topPerformer) {
      insights.push({
        type: 'success',
        title: 'Team Performance Leader',
        description: `${topPerformer.name} (${topPerformer.role}) completed ${topPerformer.completedTasks} tasks.`,
        icon: Users,
        priority: 'low',
        actionable: true,
        recommendation: 'Share best practices from top performers with the team'
      });
    }

    // Financial trend insight
    const latestCosts = data.financialOverview?.slice(-1)[0]?.totalCosts || 0;
    const previousCosts = data.financialOverview?.slice(-2)[0]?.totalCosts || 0;
    const costTrend = latestCosts > previousCosts ? 'increasing' : 'decreasing';
    
    insights.push({
      type: costTrend === 'increasing' ? 'warning' : 'success',
      title: `Costs Are ${costTrend}`,
      description: `Monthly costs ${costTrend === 'increasing' ? 'increased' : 'decreased'} by ${Math.abs(((latestCosts - previousCosts) / previousCosts) * 100).toFixed(1)}%.`,
      icon: costTrend === 'increasing' ? TrendingUp : CheckCircle,
      priority: costTrend === 'increasing' ? 'high' : 'low',
      actionable: costTrend === 'increasing',
      recommendation: costTrend === 'increasing' ? 'Review recent expenditures and identify cost reduction opportunities' : 'Continue current cost management strategies'
    });

    return insights;
  };

  const insights = generateInsights();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-purple-600" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Intelligent analysis of your operational data with actionable recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          
          return (
            <Card key={index} className={`${getInsightColor(insight.type)} border-l-4`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className={`h-5 w-5 ${getIconColor(insight.type)}`} />
                    {insight.title}
                  </CardTitle>
                  {getPriorityBadge(insight.priority)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{insight.description}</p>
                
                {insight.actionable && (
                  <div className="p-3 bg-white/50 rounded-lg border border-white/20">
                    <div className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Recommended Action:
                        </p>
                        <p className="text-sm text-gray-700">
                          {insight.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Summary & Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">
                  {insights.filter(i => i.type === 'success').length}
                </div>
                <div className="text-sm text-green-600">Positive Insights</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-600">
                  {insights.filter(i => i.actionable).length}
                </div>
                <div className="text-sm text-orange-600">Action Items</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.filter(i => i.priority === 'high').length}
                </div>
                <div className="text-sm text-blue-600">High Priority</div>
              </div>
            </div>
            
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Key Recommendation:</strong> Focus on addressing high-priority action items first to maximize operational efficiency. 
                Review cost per task metrics and consider implementing best practices from top-performing team members.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};