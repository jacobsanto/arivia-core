import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock,
  Lightbulb,
  Target
} from "lucide-react";
import { format, addDays, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  icon: any;
  metric?: string;
}

export const SmartInsights: React.FC = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['smart-insights'],
    queryFn: async () => {
      const today = new Date();
      const nextWeek = addDays(today, 7);
      const thisMonth = { start: startOfMonth(today), end: endOfMonth(today) };

      // Fetch data for analysis
      const [bookings, tasks, maintenance, listings] = await Promise.all([
        supabase.from('guesty_bookings').select('*').eq('status', 'confirmed'),
        supabase.from('housekeeping_tasks').select('*'),
        supabase.from('maintenance_tasks').select('*'),
        supabase.from('guesty_listings').select('*').eq('is_deleted', false)
      ]);

      const generatedInsights: Insight[] = [];

      // Analyze upcoming check-ins without pre-arrival tasks
      const upcomingCheckIns = bookings.data?.filter(b => {
        const checkIn = new Date(b.check_in);
        return isAfter(checkIn, today) && isBefore(checkIn, nextWeek);
      }) || [];

      if (upcomingCheckIns.length > 0) {
        const missingPrep = upcomingCheckIns.filter(booking => {
          const preparationTasks = tasks.data?.filter(t => 
            t.booking_id === booking.id && 
            new Date(t.due_date) <= new Date(booking.check_in)
          ) || [];
          return preparationTasks.length === 0;
        });

        if (missingPrep.length > 0) {
          generatedInsights.push({
            id: 'missing-prep',
            type: 'warning',
            title: 'Missing Pre-arrival Preparation',
            description: `${missingPrep.length} upcoming bookings lack preparation tasks`,
            action: 'Create housekeeping schedules',
            priority: 'high',
            icon: AlertTriangle,
            metric: `${missingPrep.length} bookings`
          });
        }
      }

      // Analyze occupancy trends
      const thisMonthBookings = bookings.data?.filter(b => {
        const checkIn = new Date(b.check_in);
        return isAfter(checkIn, thisMonth.start) && isBefore(checkIn, thisMonth.end);
      }) || [];

      const occupancyRate = listings.data?.length > 0 
        ? (thisMonthBookings.length / listings.data.length) * 100 
        : 0;

      if (occupancyRate > 85) {
        generatedInsights.push({
          id: 'high-occupancy',
          type: 'opportunity',
          title: 'Peak Occupancy Detected',
          description: `${Math.round(occupancyRate)}% occupancy this month - consider premium pricing`,
          action: 'Review pricing strategy',
          priority: 'medium',
          icon: TrendingUp,
          metric: `${Math.round(occupancyRate)}%`
        });
      } else if (occupancyRate < 50) {
        generatedInsights.push({
          id: 'low-occupancy',
          type: 'recommendation',
          title: 'Occupancy Below Target',
          description: `${Math.round(occupancyRate)}% occupancy - marketing boost recommended`,
          action: 'Review marketing channels',
          priority: 'high',
          icon: Target,
          metric: `${Math.round(occupancyRate)}%`
        });
      }

      // Analyze overdue maintenance
      const overdueMaintenance = maintenance.data?.filter(m => {
        const dueDate = new Date(m.due_date);
        return isBefore(dueDate, today) && m.status !== 'completed';
      }) || [];

      if (overdueMaintenance.length > 0) {
        generatedInsights.push({
          id: 'overdue-maintenance',
          type: 'warning',
          title: 'Overdue Maintenance Tasks',
          description: `${overdueMaintenance.length} maintenance tasks are overdue`,
          action: 'Schedule immediate repairs',
          priority: 'high',
          icon: Clock,
          metric: `${overdueMaintenance.length} tasks`
        });
      }

      // Analyze task completion efficiency
      const recentTasks = tasks.data?.filter(t => {
        const created = new Date(t.created_at);
        return isAfter(created, addDays(today, -30));
      }) || [];

      const completedTasks = recentTasks.filter(t => t.status === 'completed');
      const completionRate = recentTasks.length > 0 ? (completedTasks.length / recentTasks.length) * 100 : 0;

      if (completionRate < 70) {
        generatedInsights.push({
          id: 'low-completion',
          type: 'recommendation',
          title: 'Task Completion Below Standard',
          description: `${Math.round(completionRate)}% completion rate - workflow optimization needed`,
          action: 'Review task assignments',
          priority: 'medium',
          icon: CheckCircle,
          metric: `${Math.round(completionRate)}%`
        });
      }

      // Predictive booking analysis
      const averageBookingValue = thisMonthBookings.length > 0
        ? thisMonthBookings.reduce((sum, b) => {
            // Extract amount from raw_data if available
            const rawData = b.raw_data as any;
            const amount = rawData?.money?.totalPrice || 0;
            return sum + amount;
          }, 0) / thisMonthBookings.length
        : 0;

      if (averageBookingValue > 1000) {
        generatedInsights.push({
          id: 'premium-trend',
          type: 'prediction',
          title: 'Premium Booking Trend',
          description: `Average booking value is €${Math.round(averageBookingValue)} - market positioning is strong`,
          action: 'Maintain premium standards',
          priority: 'low',
          icon: DollarSign,
          metric: `€${Math.round(averageBookingValue)}`
        });
      }

      return generatedInsights.slice(0, 6); // Limit to top 6 insights
    },
    refetchInterval: 600000, // Refresh every 10 minutes
  });

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'prediction':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'recommendation':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights && insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <Alert key={insight.id} className={getInsightColor(insight.type)}>
                  <Icon className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{insight.title}</span>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          {insight.metric && (
                            <Badge variant="outline" className="text-xs">
                              {insight.metric}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mb-2">{insight.description}</p>
                        {insight.action && (
                          <p className="text-xs font-medium">
                            💡 {insight.action}
                          </p>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All systems are running optimally. No immediate actions required.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};