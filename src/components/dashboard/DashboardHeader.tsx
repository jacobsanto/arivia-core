
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardHeaderProps {
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  dateRange?: { from: Date; to: Date };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalTasks = 0,
  completedTasks = 0,
  pendingTasks = 0,
  dateRange
}) => {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            {dateRange 
              ? `From ${format(dateRange.from, 'MMM dd')} to ${format(dateRange.to, 'MMM dd')}`
              : 'All time'
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting completion
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge variant={completionRate >= 80 ? "default" : completionRate >= 60 ? "secondary" : "destructive"}>
              {completionRate >= 80 ? "Excellent" : completionRate >= 60 ? "Good" : "Needs Attention"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Overall performance
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHeader;
