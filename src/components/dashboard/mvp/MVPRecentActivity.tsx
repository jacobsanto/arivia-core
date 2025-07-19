
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export const MVPRecentActivity: React.FC = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const [tasks, bookings] = await Promise.all([
        supabase
          .from('housekeeping_tasks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('guesty_bookings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const combined = [
        ...(tasks.data || []).map(task => ({
          id: task.id,
          type: 'task',
          title: `${task.task_type} task`,
          description: `Due: ${task.due_date}`,
          status: task.status,
          created_at: task.created_at
        })),
        ...(bookings.data || []).map(booking => ({
          id: booking.id,
          type: 'booking',
          title: `New booking: ${booking.guest_name || 'Guest'}`,
          description: `${booking.check_in} - ${booking.check_out}`,
          status: booking.status,
          created_at: booking.created_at
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

      return combined;
    }
  });

  const getIcon = (type: string, status: string) => {
    if (type === 'booking') return Calendar;
    if (status === 'done') return CheckCircle;
    if (status === 'pending') return Clock;
    return AlertCircle;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities?.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          activities?.map((activity) => {
            const Icon = getIcon(activity.type, activity.status);
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1 rounded-full bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant="secondary" className={`text-xs ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
