
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, CheckCircle, AlertTriangle, DollarSign, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const MVPMetricsGrid: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const [properties, bookings, tasks, maintenance] = await Promise.all([
        supabase.from('guesty_listings').select('*', { count: 'exact' }),
        supabase.from('guesty_bookings').select('*', { count: 'exact' }).eq('status', 'confirmed'),
        supabase.from('housekeeping_tasks').select('*', { count: 'exact' }),
        supabase.from('maintenance_tasks').select('*', { count: 'exact' })
      ]);

      return {
        totalProperties: properties.count || 0,
        activeBookings: bookings.count || 0,
        pendingTasks: tasks.data?.filter(t => t.status === 'pending').length || 0,
        maintenanceIssues: maintenance.data?.filter(m => m.status === 'pending').length || 0
      };
    }
  });

  const metricCards = [
    {
      title: "Total Properties",
      value: metrics?.totalProperties || 0,
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Bookings",
      value: metrics?.activeBookings || 0,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending Tasks",
      value: metrics?.pendingTasks || 0,
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Maintenance Issues",
      value: metrics?.maintenanceIssues || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
