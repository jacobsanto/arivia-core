import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalyticsData } from '@/types/analytics.types';
import { Activity, Clock, Users, Zap } from 'lucide-react';

interface RealTimeMetricsProps {
  data?: AnalyticsData | null;
  loading: boolean;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ data, loading }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const liveTimer = setInterval(() => {
      setIsLive(prev => !prev);
    }, 2000);

    return () => clearInterval(liveTimer);
  }, []);

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-4 bg-muted rounded w-28"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeTeamMembers = data?.teamPerformance?.filter(member => member.completedTasks > 0).length || 0;
  const totalTasks = data?.taskTypeBreakdown?.reduce((sum, item) => sum + item.count, 0) || 0;
  const completionRate = data?.kpis?.tasksCompleted && totalTasks > 0 
    ? ((data.kpis.tasksCompleted / totalTasks) * 100).toFixed(1)
    : '0';

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-green-400'}`} />
              <span className="text-sm font-medium">Live Analytics</span>
              <Badge variant="outline" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {currentTime.toLocaleTimeString()}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-medium">{completionRate}%</span>
              <span className="text-muted-foreground">Completion Rate</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{activeTeamMembers}</span>
              <span className="text-muted-foreground">Active Team</span>
            </div>

            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{data?.kpis?.openIssues || 0}</span>
              <span className="text-muted-foreground">Open Issues</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-green-600">
                ${(data?.kpis?.totalOperationalCosts || 0).toLocaleString()}
              </span>
              <span className="text-muted-foreground">Total Costs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};